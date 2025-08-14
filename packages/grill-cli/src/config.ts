import type { AnchorIdl } from "@codama/nodes-from-anchor";
import type { Node, Visitor } from "codama";

/**
 * Context provided to visitor functions
 */
export interface VisitorContext {
  /** The parsed Anchor IDL */
  idl: AnchorIdl;
}

/**
 * Configuration for Grill code generation
 */
export interface GrillConfig {
  /**
   * Additional root node visitors to apply to the Codama nodes before generating code.
   * These visitors are applied in order after the initial Anchor IDL parsing.
   * Can be either an array of visitors or a function that returns an array of visitors.
   */
  visitors?:
    | Visitor<Node | null, "rootNode">[]
    | ((context: VisitorContext) => Visitor<Node | null, "rootNode">[]);
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
 * // Using an array of visitors
 * export default defineConfig({
 *   visitors: [
 *     someCustomVisitor(),
 *   ],
 * });
 *
 * // Using a function that returns visitors
 * export default defineConfig({
 *   visitors: ({ idl }) => [
 *     someCustomVisitor(idl),
 *   ],
 * });
 * ```
 */
export function defineConfig(config: GrillConfig): GrillConfig {
  return config;
}
