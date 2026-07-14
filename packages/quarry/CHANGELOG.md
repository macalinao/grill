# @macalinao/quarry

## 0.4.0

### Minor Changes

- 3e03157: Upgrade to `@solana/kit` v6 and refresh dependencies.

  **Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.
  - Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
  - Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
  - Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

  > Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.

### Patch Changes

- Updated dependencies [3e03157]
  - @macalinao/gill-extra@0.5.0
  - @macalinao/token-utils@0.2.0

## 0.3.2

### Patch Changes

- 804b34f: update some dependencies
- Updated dependencies [804b34f]
- Updated dependencies [86e4165]
  - @macalinao/token-utils@0.1.15
  - @macalinao/gill-extra@0.4.0

## 0.3.1

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies
- Updated dependencies [74d15f7]
- Updated dependencies [2f832a8]
  - @macalinao/token-utils@0.1.14
  - @macalinao/gill-extra@0.3.2

## 0.3.0

### Minor Changes

- c3b2bf4: Update to latest Gill/Kit

### Patch Changes

- 7aa4e36: Eslint 9.38 force
- Updated dependencies [7aa4e36]
- Updated dependencies [c3b2bf4]
  - @macalinao/token-utils@0.1.13
  - @macalinao/gill-extra@0.3.0

## 0.2.6

### Patch Changes

- c9b6849: Update dependencies
- 3f9e7d9: Remove unnecessary arguments
- 8964b7b: Update dependencies
- Updated dependencies [c9b6849]
- Updated dependencies [3f9e7d9]
- Updated dependencies [c093c0e]
- Updated dependencies [0a8bc95]
- Updated dependencies [8964b7b]
  - @macalinao/token-utils@0.1.11
  - @macalinao/gill-extra@0.2.1

## 0.2.5

### Patch Changes

- Updated dependencies [5ebaaa1]
- Updated dependencies [ef7c68e]
  - @macalinao/gill-extra@0.2.0

## 0.2.4

### Patch Changes

- f17031d: Fix bun-types import
- Updated dependencies [f17031d]
- Updated dependencies [d3ee6e1]
  - @macalinao/token-utils@0.1.9
  - @macalinao/gill-extra@0.1.3

## 0.2.3

### Patch Changes

- fecc82c: Bump dependencies
- Updated dependencies [fecc82c]
  - @macalinao/gill-extra@0.1.2

## 0.2.2

### Patch Changes

- Updated dependencies [9bd8013]
  - @macalinao/gill-extra@0.1.0

## 0.2.1

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages
- Updated dependencies [481456c]
  - @macalinao/gill-extra@0.0.8

## 0.2.0

### Minor Changes

- 7300702: Fix bugs around quarry merge miner initialization, more pda hooks

### Patch Changes

- 7768fe9: Fix deposit/withdraw bugs

## 0.1.0

### Minor Changes

- d57f739: Update dependencies, including Gill

## 0.0.4

### Patch Changes

- 42846e7: Dependency bumps

## 0.0.3

### Patch Changes

- b577d51: Add support for multiple pdas/token accounts being fetched

## 0.0.2

### Patch Changes

- aef5258: Update all dependencies

## 0.0.1

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/token-utils@0.1.8
