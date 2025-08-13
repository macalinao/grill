import type { Node, Visitor } from "codama";

/**
 * Configuration for Grill code generation
 */
export interface GrillConfig {
  /**
   * Additional root node visitors to apply to the Codama nodes before generating code.
   * These visitors are applied in order after the initial Anchor IDL parsing.
   */
  visitors?: Visitor<Node | null, "rootNode">[];
}

/**
 * Define a Grill configuration.
 *
 * @param config - The configuration object
 * @returns The configuration object (for type safety)
 *
 * @example
 * ```typescript
 * // grill.config.mjs
 * import { defineConfig } from "@macalinao/grill-cli";
 * import { someCustomVisitor } from "./visitors/custom.js";
 *
 * export default defineConfig({
 *   visitors: [
 *     someCustomVisitor(),
 *   ],
 * });
 * ```
 */
export function defineConfig(config: GrillConfig): GrillConfig {
  return config;
}
