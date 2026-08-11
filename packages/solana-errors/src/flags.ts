/**
 * Build-time flag controlling whether the human-readable error message tables
 * are included in the bundle.
 *
 * The tables are ~7 KB minified. They are included by default. To strip them,
 * define `__GRILL_ERROR_MESSAGES__` as `false` in your bundler:
 *
 * ```ts
 * // vite.config.ts
 * export default defineConfig({
 *   define: { __GRILL_ERROR_MESSAGES__: "false" },
 * });
 * ```
 *
 * ```ts
 * // esbuild / tsdown
 * { define: { __GRILL_ERROR_MESSAGES__: "false" } }
 * ```
 *
 * ```ts
 * // webpack
 * new webpack.DefinePlugin({ __GRILL_ERROR_MESSAGES__: false })
 * ```
 *
 * With the flag defined as `false`, the ternary below folds to a constant, the
 * table lookups become unreachable, and the tables are dropped as dead code.
 * Errors then report their variant name (e.g. `Instruction error:
 * InvalidArgument`) rather than a prose description.
 *
 * The `typeof` guard means an undefined identifier is safe: when the flag is
 * not defined at all, `typeof` yields `"undefined"` rather than throwing a
 * `ReferenceError`, and messages stay enabled.
 */
declare const __GRILL_ERROR_MESSAGES__: boolean | undefined;

export const ERROR_MESSAGES_ENABLED: boolean =
  typeof __GRILL_ERROR_MESSAGES__ === "boolean"
    ? __GRILL_ERROR_MESSAGES__
    : true;
