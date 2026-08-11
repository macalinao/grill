---
"@macalinao/solana-errors": minor
---

Allow the human-readable error message tables to be stripped from production bundles.

Define `__GRILL_ERROR_MESSAGES__` as `false` in your bundler to drop them:

```ts
// vite.config.ts
export default defineConfig({
  define: { __GRILL_ERROR_MESSAGES__: "false" },
});
```

With the flag set, `getInstructionErrorMessage` and `getTransactionErrorMessage` report the variant name (e.g. `Transaction error: BlockhashNotFound`) instead of its prose description, and both message tables are dropped as dead code — ~8 KB down to ~1.7 KB minified.

Messages remain enabled by default, so this is opt-in and existing behaviour is unchanged. The tables are only dropped if you do not import `INSTRUCTION_ERROR_MESSAGES` or `TRANSACTION_ERROR_MESSAGES` directly. A new `ERROR_MESSAGES_ENABLED` export exposes the resolved flag.

Note that this relies on your bundler re-running dead-code elimination after constant folding: Rollup, rolldown, and Vite do, but plain esbuild and `bun build` do not.
