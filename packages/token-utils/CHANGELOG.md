# @macalinao/token-utils

## 0.2.1

### Patch Changes

- 2a0be1d: Fix correctness issues surfaced by stricter type-aware lint rules.

  - `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
  - `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
  - `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
  - `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
  - `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.

- 9a97870: Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.

## 0.2.0

### Minor Changes

- 3e03157: Upgrade to `@solana/kit` v6 and refresh dependencies.

  **Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.

  - Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
  - Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
  - Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

  > Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.

## 0.1.16

### Patch Changes

- 9fccefb: createLamports helper

## 0.1.15

### Patch Changes

- 804b34f: update some dependencies

## 0.1.14

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies

## 0.1.13

### Patch Changes

- 7aa4e36: Eslint 9.38 force

## 0.1.12

### Patch Changes

- dbe5fa8: use better SOL icon

## 0.1.11

### Patch Changes

- c9b6849: Update dependencies
- 3f9e7d9: Remove unnecessary arguments
- c093c0e: Fix broken token metadata fetching -- allow for empty symbols
- 8964b7b: Update dependencies

## 0.1.10

### Patch Changes

- ceff137: Add toNumber helper for TokenAmount

## 0.1.9

### Patch Changes

- f17031d: Fix bun-types import

## 0.1.8

### Patch Changes

- 85dece6: Alter Biome config

## 0.1.7

### Patch Changes

- 3411158: More tmath changes

## 0.1.6

### Patch Changes

- a9d96c1: Support commas in parseTokenAmount
- e8cb12d: Add tmath module

## 0.1.5

### Patch Changes

- 57adf4b: README license updates

## 0.1.4

### Patch Changes

- 9bc5c90: Breaking: Simplify useAccounts return type
- b3c1751: Dependency bumps

## 0.1.3

### Patch Changes

- 6ca32bc: Fix src/ not being included in packages
- 6eb3aa0: Add createTokenAmount function

## 0.1.2

### Patch Changes

- 2cd4a4b: Move @types/bun into catalog

## 0.1.1

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges
