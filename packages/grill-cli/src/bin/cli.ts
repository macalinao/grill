#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { AnchorIdl } from "@codama/nodes-from-anchor";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { renderESMTypeScriptVisitor } from "@macalinao/codama-renderers-js-esm";
import { createFromRoot } from "codama";
import { Command } from "commander";
import type { GrillConfig } from "../config.js";

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const program = new Command();

program
  .name("grill")
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
    "Path to grill.config.mjs file",
    "./grill.config.mjs",
  )
  .action(async (options: { idl: string; output: string; config: string }) => {
    try {
      const configPath = resolve(options.config);

      // Load config first if it exists
      let config: GrillConfig = {};
      if (await fileExists(configPath)) {
        console.log(`Loading config from ${configPath}...`);

        // Dynamic import of the config file
        const configUrl = new URL(`file://${configPath}`);
        const configModule = (await import(configUrl.href)) as {
          default: GrillConfig;
        };
        config = configModule.default;
      }

      // Use config values if provided, otherwise fall back to command line options
      const idlPath = resolve(config.idlPath ?? options.idl);
      const outputPath = resolve(config.outputDir ?? options.output);

      // Check if IDL file exists
      if (!(await fileExists(idlPath))) {
        console.error(`Error: IDL file not found at ${idlPath}`);
        process.exit(1);
      }

      // Load the IDL
      console.log(`Loading IDL from ${idlPath}...`);
      const idlContent = await readFile(idlPath, "utf-8");
      const idl = JSON.parse(idlContent) as AnchorIdl;

      // Create root node from Anchor IDL
      console.log("Creating Grill nodes from Anchor IDL...");

      const root = rootNodeFromAnchor(idl);
      const codama = createFromRoot(root);

      // Apply additional visitors from config
      if (config.visitors) {
        // Resolve visitors - either array or function
        const visitors =
          typeof config.visitors === "function"
            ? config.visitors({ idl })
            : config.visitors;

        if (visitors.length > 0) {
          console.log(
            `Applying ${visitors.length.toLocaleString()} custom visitor(s)...`,
          );
          for (const visitor of visitors) {
            codama.update(visitor);
          }
        }
      }

      // Apply the ESM TypeScript visitor
      console.log(`Generating client to ${outputPath}...`);
      codama.accept(renderESMTypeScriptVisitor(outputPath));

      console.log("✅ Client generated successfully!");
    } catch (error) {
      console.error("Error generating client:", error);
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize a new grill.config.mjs file")
  .option(
    "-c, --config <path>",
    "Path for the config file",
    "./grill.config.mjs",
  )
  .action(async (options: { config: string }) => {
    try {
      const configPath = resolve(options.config);

      // Check if config already exists
      if (await fileExists(configPath)) {
        console.error(`Error: Config file already exists at ${configPath}`);
        process.exit(1);
      }

      // Create config template
      const configTemplate = `/**
 * @type {import('@macalinao/grill-cli').GrillConfig}
 */
export default {
  // Optional: Path to the Anchor IDL file (overrides --idl option)
  // idlPath: "./target/idl/program.json",
  
  // Optional: Output directory for generated client (overrides --output option)
  // outputDir: "./src/generated",
  
  // Optional: Add custom visitors to transform the Codama tree
  // Can be an array of visitors or a function that returns visitors
  // visitors: [
  //   // Example: Add a custom visitor
  //   someVisitor(),
  // ],
  
  // Example using a function to access the IDL:
  // visitors: ({ idl }) => [
  //   customVisitor(idl),
  // ],
};
`;

      // Write config file
      const { writeFile } = await import("node:fs/promises");
      await writeFile(configPath, configTemplate, "utf-8");

      console.log(`✅ Created grill.config.mjs at ${configPath}`);
      console.log("\nNext steps:");
      console.log(
        "1. Edit grill.config.mjs to customize your client generation",
      );
      console.log("2. Run 'grill generate' to generate your Solana client");
    } catch (error) {
      console.error("Error creating config file:", error);
      process.exit(1);
    }
  });

program.parse();
