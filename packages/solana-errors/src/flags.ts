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
 * With the flag defined as `false`, the ternary below folds to a constant and
 * the table lookups become unreachable. Errors then report their variant name
 * (e.g. `Instruction error: InvalidArgument`) rather than a prose description.
 *
 * Whether the now-unreferenced tables actually leave the bundle is up to the
 * consuming bundler: it has to re-run dead-code elimination after constant
 * folding. Rollup, rolldown, and Vite do; plain esbuild and `bun build` fold
 * the branch but keep the tables. This package ships unbundled, so
 * `__GRILL_ERROR_MESSAGES__` survives into `dist/` for the consumer's `define`
 * to replace. See the README for the full caveats.
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
