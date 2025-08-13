#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { AnchorIdl } from "@codama/nodes-from-anchor";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { renderESMTypeScriptVisitor } from "@macalinao/codama-renderers-js-esm";
import { createFromRoot, visit } from "codama";
import { Command } from "commander";
import type { CodamaConfig } from "../config.js";

const program = new Command();

program
  .name("codama")
  .description("Zero-config CLI for generating clients for Solana programs")
  .version("0.0.1");

program
  .command("generate")
  .alias("gen")
  .description("Generate a client from an Anchor IDL")
  .option(
    "-i, --idl <path>",
    "Path to the Anchor IDL file",
    "./target/idl/program.json",
  )
  .option(
    "-o, --output <path>",
    "Output directory for generated client",
    "./src/generated",
  )
  .option(
    "-c, --config <path>",
    "Path to codama.config.mjs file",
    "./codama.config.mjs",
  )
  .action(async (options: { idl: string; output: string; config: string }) => {
    try {
      const idlPath = resolve(options.idl);
      const outputPath = resolve(options.output);
      const configPath = resolve(options.config);

      // Check if IDL file exists
      if (!(await exists(idlPath))) {
        console.error(`Error: IDL file not found at ${idlPath}`);
        process.exit(1);
      }

      // Load the IDL
      console.log(`Loading IDL from ${idlPath}...`);
      const idlContent = await readFile(idlPath, "utf-8");
      const idl = JSON.parse(idlContent) as AnchorIdl;

      // Create root node from Anchor IDL
      console.log("Creating Codama nodes from Anchor IDL...");

      const root = rootNodeFromAnchor(idl);
      const codama = createFromRoot(root);

      // Load and apply config if it exists
      if (await exists(configPath)) {
        console.log(`Loading config from ${configPath}...`);

        // Dynamic import of the config file
        const configUrl = new URL(`file://${configPath}`);
        const configModule = (await import(configUrl.href)) as {
          default: CodamaConfig;
        };
        const config = configModule.default;

        // Apply additional visitors from config
        if (config.visitors && config.visitors.length > 0) {
          console.log(
            `Applying ${config.visitors.length.toLocaleString()} custom visitor(s)...`,
          );
          for (const visitor of config.visitors) {
            codama.update(visitor);
          }
        }
      } else {
        console.log("No config file found, using defaults...");
      }

      // Apply the ESM TypeScript visitor
      console.log(`Generating client to ${outputPath}...`);
      const esmVisitor = renderESMTypeScriptVisitor(outputPath);
      visit(root, esmVisitor);

      console.log("✅ Client generated successfully!");
    } catch (error) {
      console.error("Error generating client:", error);
      process.exit(1);
    }
  });

program.parse();
