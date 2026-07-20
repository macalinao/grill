# @macalinao/zod-solana

## 0.3.1

### Patch Changes

- 9a97870: Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.

## 0.3.0

### Minor Changes

- 3e03157: Upgrade to `@solana/kit` v6 and refresh dependencies.

  **Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.

  - Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
  - Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
  - Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

  > Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.

## 0.2.2

### Patch Changes

- 804b34f: update some dependencies

## 0.2.1

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies

## 0.2.0

### Minor Changes

- c3b2bf4: Update to latest Gill/Kit

### Patch Changes

- 78e5e42: Add BPS schema
- 7aa4e36: Eslint 9.38 force

## 0.1.10

### Patch Changes

- cc2378b: support isolated declarations in zod-solana

## 0.1.9

### Patch Changes

- f17031d: Fix bun-types import

## 0.1.8

### Patch Changes

- fecc82c: Bump dependencies

## 0.1.7

### Patch Changes

- 42846e7: Dependency bumps

## 0.1.6

### Patch Changes

- b577d51: Add support for multiple pdas/token accounts being fetched

## 0.1.5

### Patch Changes

- 3d64ada: Update zod import to be tree shakeable

## 0.1.4

### Patch Changes

- 85dece6: Alter Biome config

## 0.1.3

### Patch Changes

- 1a5e0bd: Update dependencies

## 0.1.2

### Patch Changes

- 57adf4b: README license updates

## 0.1.1

### Patch Changes

- b3c1751: Dependency bumps

## 0.1.0

### Minor Changes

- 912b622: Add uint8array support
- 5c893a9: Add unsigned int schemas

## 0.0.5

### Patch Changes

- 4e5efaa: Clean up dependencies and peer dependencies
- 2cd4a4b: Move @types/bun into catalog

## 0.0.4

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges

## 0.0.3

### Patch Changes

- 5555546: Fix TypeScript issues with Zod type
- 87c6415: Add support for token metadata fetching

## 0.0.2

### Patch Changes

- 26af4d0: Add address validator for Zod
