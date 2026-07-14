# @macalinao/dataloader-es

## 0.2.8

### Patch Changes

- 2a0be1d: Fix correctness issues surfaced by stricter type-aware lint rules.

  - `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
  - `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
  - `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
  - `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
  - `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.

- 9a97870: Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.

## 0.2.7

### Patch Changes

- 804b34f: update some dependencies

## 0.2.6

### Patch Changes

- f17031d: Fix bun-types import

## 0.2.5

### Patch Changes

- 85dece6: Alter Biome config

## 0.2.4

### Patch Changes

- 57adf4b: README license updates

## 0.2.3

### Patch Changes

- 4e5efaa: Clean up dependencies and peer dependencies
- 2cd4a4b: Move @types/bun into catalog

## 0.2.2

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges

## 0.2.1

### Patch Changes

- f450ea4: Re-release for fixed chagneset config

## 0.2.0

### Minor Changes

- 32cc1bb: Force republish
