# @macalinao/solana-batch-accounts-loader

## 0.3.0

### Minor Changes

- 3e03157: Upgrade to `@solana/kit` v6 and refresh dependencies.

  **Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.
  - Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
  - Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
  - Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

  > Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.

## 0.2.9

### Patch Changes

- 804b34f: update some dependencies
- Updated dependencies [804b34f]
  - @macalinao/dataloader-es@0.2.7

## 0.2.8

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies

## 0.2.7

### Patch Changes

- f17031d: Fix bun-types import
- Updated dependencies [f17031d]
  - @macalinao/dataloader-es@0.2.6

## 0.2.6

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages

## 0.2.5

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/dataloader-es@0.2.5

## 0.2.4

### Patch Changes

- 57adf4b: README license updates
- Updated dependencies [57adf4b]
  - @macalinao/dataloader-es@0.2.4

## 0.2.3

### Patch Changes

- 4e5efaa: Clean up dependencies and peer dependencies
- 2cd4a4b: Move @types/bun into catalog
- Updated dependencies [4e5efaa]
- Updated dependencies [2cd4a4b]
  - @macalinao/dataloader-es@0.2.3

## 0.2.2

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges
- Updated dependencies [c7eb4a2]
  - @macalinao/dataloader-es@0.2.2

## 0.2.1

### Patch Changes

- f450ea4: Re-release for fixed chagneset config
- Updated dependencies [f450ea4]
  - @macalinao/dataloader-es@0.2.1

## 0.2.0

### Minor Changes

- 32cc1bb: Force republish

### Patch Changes

- Updated dependencies [32cc1bb]
  - @macalinao/dataloader-es@0.2.0
