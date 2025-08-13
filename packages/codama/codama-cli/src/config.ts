import type { Node, Visitor } from "codama";

/**
 * Configuration for Codama code generation
 */
export interface CodamaConfig {
  /**
   * Additional root node visitors to apply to the Codama nodes before generating code.
   * These visitors are applied in order after the initial Anchor IDL parsing.
   */
  visitors?: Visitor<Node | null, "rootNode">[];
}

/**
 * Define a Codama configuration.
 *
 * @param config - The configuration object
 * @returns The configuration object (for type safety)
 *
 * @example
 * ```typescript
 * // codama.config.ts
 * import { defineConfig } from "@macalinao/codama-cli";
 * import { someCustomVisitor } from "./visitors/custom.js";
 *
 * export default defineConfig({
 *   visitors: [
 *     someCustomVisitor(),
 *   ],
 * });
 * ```
 */
export function defineConfig(config: CodamaConfig): CodamaConfig {
  return config;
}
