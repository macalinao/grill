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
      const idlPath = resolve(options.idl);
      const outputPath = resolve(options.output);
      const configPath = resolve(options.config);

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

      // Load and apply config if it exists
      if (await fileExists(configPath)) {
        console.log(`Loading config from ${configPath}...`);

        // Dynamic import of the config file
        const configUrl = new URL(`file://${configPath}`);
        const configModule = (await import(configUrl.href)) as {
          default: GrillConfig;
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
  // Optional: Add custom visitors to transform the Codama tree
  visitors: [
    // Example: Add a custom visitor
    // (node) => {
    //   // Transform the node
    //   return node;
    // }
  ],
  
  // Optional: Configure the output
  output: {
    // Add any output configuration here
  }
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
