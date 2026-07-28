# @macalinao/react-quarry

## 7.0.0

### Patch Changes

- Updated dependencies [3d44354]
  - @macalinao/grill@0.12.0
  - @macalinao/quarry@0.4.3

## 6.0.0

### Patch Changes

- 2a0be1d: Fix correctness issues surfaced by stricter type-aware lint rules.

  - `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
  - `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
  - `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
  - `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
  - `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.

- 9a97870: Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.
- Updated dependencies [879d444]
- Updated dependencies [2a0be1d]
- Updated dependencies [9a97870]
  - @macalinao/grill@0.11.0
  - @macalinao/quarry@0.4.1

## 5.0.0

### Major Changes

- 3e03157: Upgrade to `@solana/kit` v6 and refresh dependencies.

  **Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.

  - Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
  - Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
  - Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

  > Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.

### Patch Changes

- Updated dependencies [3e03157]
  - @macalinao/grill@0.10.0
  - @macalinao/quarry@0.4.0

## 4.0.0

### Patch Changes

- 804b34f: update some dependencies
- Updated dependencies [804b34f]
- Updated dependencies [550b61b]
- Updated dependencies [86e4165]
  - @macalinao/quarry@0.3.2
  - @macalinao/grill@0.9.0

## 3.0.1

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies
- Updated dependencies [74d15f7]
- Updated dependencies [2f832a8]
  - @macalinao/quarry@0.3.1
  - @macalinao/grill@0.8.2

## 3.0.0

### Patch Changes

- Updated dependencies [7aa4e36]
- Updated dependencies [c3b2bf4]
  - @macalinao/quarry@0.3.0
  - @macalinao/grill@0.8.0

## 2.0.0

### Patch Changes

- Updated dependencies [5ebaaa1]
- Updated dependencies [ef7c68e]
  - @macalinao/grill@0.7.0
  - @macalinao/quarry@0.2.5

## 1.0.4

### Patch Changes

- d8f999b: Allow specifying custom loading state for merge miner provider
- ffac787: Bump to Bun 1.3
- Updated dependencies [ffac787]
  - @macalinao/grill@0.6.5

## 1.0.3

### Patch Changes

- f17031d: Fix bun-types import
- 6e1a67b: Fix bug with useGeneratedValue (not aborted)
- Updated dependencies [f17031d]
- Updated dependencies [d3ee6e1]
  - @macalinao/quarry@0.2.4
  - @macalinao/grill@0.6.4

## 1.0.2

### Patch Changes

- fecc82c: Bump dependencies
- Updated dependencies [fecc82c]
  - @macalinao/quarry@0.2.3
  - @macalinao/grill@0.6.3

## 1.0.1

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages
- Updated dependencies [481456c]
  - @macalinao/quarry@0.2.1
  - @macalinao/grill@0.6.1

## 1.0.0

### Minor Changes

- 7300702: Fix bugs around quarry merge miner initialization, more pda hooks

### Patch Changes

- Updated dependencies [7768fe9]
- Updated dependencies [7300702]
  - @macalinao/quarry@0.2.0
  - @macalinao/grill@0.6.0

## 0.1.0

### Minor Changes

- ea6f8a5: rename balance -> blanceRaw, expose mergeMinerAddress

### Patch Changes

- 56571db: Fix peer dep

## 0.0.11

### Patch Changes

- Updated dependencies [d57f739]
  - @macalinao/quarry@0.1.0

## 0.0.10

### Patch Changes

- 42846e7: Dependency bumps
- Updated dependencies [42846e7]
  - @macalinao/quarry@0.0.4
  - @macalinao/grill@0.5.14

## 0.0.9

### Patch Changes

- Updated dependencies [b0a90a2]
  - @macalinao/grill@0.5.13

## 0.0.8

### Patch Changes

- Updated dependencies [b577d51]
  - @macalinao/quarry@0.0.3
  - @macalinao/grill@0.5.12

## 0.0.7

### Patch Changes

- Updated dependencies [48ec0ee]
  - @macalinao/grill@0.5.11

## 0.0.6

### Patch Changes

- @macalinao/grill@0.5.10

## 0.0.5

### Patch Changes

- aef5258: Update all dependencies
- Updated dependencies [aef5258]
  - @macalinao/quarry@0.0.2
  - @macalinao/grill@0.5.9

## 0.0.4

### Patch Changes

- @macalinao/grill@0.5.8

## 0.0.3

### Patch Changes

- Updated dependencies [bf01031]
- Updated dependencies [d6e8cfb]
  - @macalinao/grill@0.5.7

## 0.0.2

### Patch Changes

- d0e677b: Update dependencies, speed up linting
- Updated dependencies [d0e677b]
  - @macalinao/grill@0.5.6

## 0.0.1

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/quarry@0.0.1
  - @macalinao/grill@0.5.5
