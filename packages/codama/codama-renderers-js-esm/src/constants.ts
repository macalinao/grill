/**
 * Dependency map for ESM module resolution in Codama-generated code.
 *
 * This map defines how internal module dependencies should be resolved when generating
 * ESM-compatible TypeScript/JavaScript code. Each key represents a dependency identifier
 * used in the Codama code generation process, and each value is the relative path
 * to the actual module file in the generated output.
 *
 * The paths are relative to the importing module and include the .js extension
 * for proper ESM resolution, even when the source files are TypeScript.
 *
 * @example
 * - "errors" maps to "../errors/index.js" for error type definitions
 * - "generatedAccounts" maps to "../accounts/index.js" for account structures
 * - "hooked" maps to "../../hooked/index.js" for hook implementations
 */
export const ESM_DEPENDENCY_MAP = {
  errors: "../errors/index.js",
  generated: "../index.js",
  generatedAccounts: "../accounts/index.js",
  generatedErrors: "../errors/index.js",
  generatedInstructions: "../instructions/index.js",
  generatedPdas: "../pdas/index.js",
  generatedPrograms: "../programs/index.js",
  generatedTypes: "../types/index.js",
  hooked: "../../hooked/index.js",
  shared: "../shared/index.js",
  types: "../types/index.js",
};
