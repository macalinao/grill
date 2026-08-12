# @macalinao/solana-errors

## 0.4.0

### Minor Changes

- 2d68f3c: Allow the human-readable error message tables to be stripped from production bundles.

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

## 0.3.0

### Minor Changes

- 548a2d6: Add support for `@solana/kit` v7.

  The `@solana/kit` peer dependency range widens from `^6` to `^6 || ^7`, so this is not a
  breaking change — projects still on kit 6 keep working, and projects on kit 7 are now
  supported. Every package is typechecked and tested against both majors.

  The Solana program clients used internally move to their kit-7 releases:

  - `@solana-program/address-lookup-table` `^0.12.1` -> `^0.13.0`
  - `@solana-program/system` `^0.12.2` -> `^0.13.0`
  - `@solana-program/token` `^0.14.0` -> `^0.15.0`

  These declare `@solana/kit: ^7.0.0` as their own peer, so on kit 6 your package manager
  will warn about an unsatisfied peer range for them. Their types are compatible with kit 6
  in the ways Grill uses them, but kit 7 is the recommended target.

  No Grill APIs changed. None of the APIs removed in kit 7 (`ReactiveStreamStore`'s
  construction-time `abortSignal` and auto-connect, `getUnifiedState`,
  `getMinimumBalanceForRentExemption` from `@solana/kit`, `createEmptyClient`) were used
  by these packages.

## 0.2.0

### Minor Changes

- d482b80: Add @macalinao/solana-errors package for formatting Solana transaction and instruction errors in production without the `__DEV__` flag, and use it in gill-extra's transaction error handling.
