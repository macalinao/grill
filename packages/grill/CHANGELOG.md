# @macalinao/grill

## 0.11.1

### Patch Changes

- f46cd21: Update Solana program client dependencies to their latest versions: `@solana-program/token` (0.14.0), `@solana-program/token-2022` (0.12.0), `@solana-program/address-lookup-table` (0.12.1), and the `@macalinao/clients-*` codegen packages (0.5.1 / 0.2.1).
- Updated dependencies [f46cd21]
  - @macalinao/gill-extra@0.6.1

## 0.11.0

### Minor Changes

- 879d444: Add real-time subscription support to the plural account hooks. `useAccounts` and `useTokenAccounts` (and any hook built with `createDecodedAccountsHook`) now accept `subscribeToUpdates`, mirroring the singular `useAccount`/`useTokenAccount`.

  - New `useAccountsSubscription(addresses, decoder, enabled)` hook — the plural counterpart to `useAccountSubscription`, stable against fresh array references.
  - Export `createAccountDecoderFromDecoder`, the `Decoder` → `AccountDecoder` adapter previously private to `useAccount`, so consumers of the raw `SubscriptionManager` no longer need to hand-write it.
  - The plural hooks' `addresses` now accepts a nullable, readonly array, so the result of a plural PDA hook like `useAssociatedTokenPdas` can be passed directly (`addresses: atas`) without `?? []`.

### Patch Changes

- 2a0be1d: Fix correctness issues surfaced by stricter type-aware lint rules.

  - `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
  - `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
  - `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
  - `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
  - `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.

- 9a97870: Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.
- Updated dependencies [d482b80]
- Updated dependencies [2a0be1d]
- Updated dependencies [9a97870]
  - @macalinao/gill-extra@0.6.0
  - @macalinao/dataloader-es@0.2.8
  - @macalinao/solana-batch-accounts-loader@0.3.1
  - @macalinao/token-utils@0.2.1
  - @macalinao/zod-solana@0.3.1

## 0.10.0

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
  - @macalinao/solana-batch-accounts-loader@0.3.0
  - @macalinao/token-utils@0.2.0
  - @macalinao/zod-solana@0.3.0

## 0.9.1

### Patch Changes

- 0189ee8: remove debug logs
- Updated dependencies [0189ee8]
  - @macalinao/gill-extra@0.4.2

## 0.9.0

### Minor Changes

- 550b61b: Add WebSocket subscription support for real-time account updates

  This release adds a subscription system that allows React components to receive real-time account updates via WebSocket connections. Key features:

  - **`subscribeToUpdates` option**: Pass `{ subscribeToUpdates: true }` to `useAccount` or hooks created with `createDecodedAccountHook` to enable real-time updates
  - **Reference-counted subscriptions**: Multiple components subscribing to the same account share a single WebSocket connection
  - **Automatic cache updates**: When an account changes on-chain, the React Query cache is automatically updated
  - **Automatic cleanup**: Subscriptions are cleaned up when all subscribers unmount

  Example usage:

  ```tsx
  // Subscribe to real-time updates for an account
  const { account } = useAccount({
    address: myAddress,
    decoder: myDecoder,
    subscribeToUpdates: true,
  });

  // Or with a typed account hook
  const useMyAccount = createDecodedAccountHook(myDecoder);
  const { account } = useMyAccount({
    address: myAddress,
    subscribeToUpdates: true,
  });
  ```

  The `SubscriptionProvider` is now automatically included in `GrillHeadlessProvider` and `GrillProvider`, so no additional setup is required.

- 86e4165: Add transaction simulation logging with Solana Explorer inspector URLs
  - Added `logTransactionSimulation` function to log detailed debugging info when simulations fail
  - Automatically generates Solana Explorer inspector URLs with proper support for localhost/custom RPC endpoints
  - Added `createTransactionInspectorUrlWithOptions` for creating inspector URLs with custom RPC URL support
  - GrillProvider now accepts `rpcUrl` and `cluster` props for proper inspector URL generation
  - Console output includes color-coded logs, inspector URL, and copy-paste debugging block

### Patch Changes

- 804b34f: update some dependencies
- Updated dependencies [804b34f]
- Updated dependencies [86e4165]
  - @macalinao/solana-batch-accounts-loader@0.2.9
  - @macalinao/dataloader-es@0.2.7
  - @macalinao/token-utils@0.1.15
  - @macalinao/gill-extra@0.4.0
  - @macalinao/zod-solana@0.2.2

## 0.8.2

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies
- Updated dependencies [74d15f7]
- Updated dependencies [2f832a8]
  - @macalinao/solana-batch-accounts-loader@0.2.8
  - @macalinao/token-utils@0.1.14
  - @macalinao/gill-extra@0.3.2
  - @macalinao/zod-solana@0.2.1

## 0.8.1

### Patch Changes

- 01aff6c: Allow opting out of the certified token list for unknown token metadata
- Updated dependencies [01aff6c]
  - @macalinao/gill-extra@0.3.1

## 0.8.0

### Minor Changes

- c3b2bf4: Update to latest Gill/Kit

### Patch Changes

- Updated dependencies [78e5e42]
- Updated dependencies [7aa4e36]
- Updated dependencies [c3b2bf4]
  - @macalinao/zod-solana@0.2.0
  - @macalinao/token-utils@0.1.13
  - @macalinao/gill-extra@0.3.0

## 0.7.4

### Patch Changes

- cd3464c: fix error message for using context in wrong spot

## 0.7.3

### Patch Changes

- cc2378b: support isolated declarations in zod-solana
- Updated dependencies [cc2378b]
  - @macalinao/zod-solana@0.1.10

## 0.7.2

### Patch Changes

- c9b6849: Update dependencies
- 3f9e7d9: Remove unnecessary arguments
- c093c0e: Fix broken token metadata fetching -- allow for empty symbols
- 8964b7b: Update dependencies
- Updated dependencies [c9b6849]
- Updated dependencies [3f9e7d9]
- Updated dependencies [c093c0e]
- Updated dependencies [0a8bc95]
- Updated dependencies [8964b7b]
  - @macalinao/token-utils@0.1.11
  - @macalinao/gill-extra@0.2.1

## 0.7.1

### Patch Changes

- 90affa8: Add ALT fetching hooks
- f4b610c: Reorganize directory structure of account/pda fetchers

## 0.7.0

### Minor Changes

- ef7c68e: Change compute unit stuff to be not included by default

### Patch Changes

- 5ebaaa1: Add parseTransactionError, new error type
- Updated dependencies [5ebaaa1]
- Updated dependencies [ef7c68e]
  - @macalinao/gill-extra@0.2.0

## 0.6.5

### Patch Changes

- ffac787: Bump to Bun 1.3
- Updated dependencies [ceff137]
  - @macalinao/token-utils@0.1.10

## 0.6.4

### Patch Changes

- f17031d: Fix bun-types import
- d3ee6e1: Bump dependencies
- Updated dependencies [f17031d]
- Updated dependencies [d3ee6e1]
  - @macalinao/solana-batch-accounts-loader@0.2.7
  - @macalinao/dataloader-es@0.2.6
  - @macalinao/token-utils@0.1.9
  - @macalinao/gill-extra@0.1.3
  - @macalinao/zod-solana@0.1.9

## 0.6.3

### Patch Changes

- fecc82c: Bump dependencies
- Updated dependencies [fecc82c]
  - @macalinao/gill-extra@0.1.2
  - @macalinao/zod-solana@0.1.8

## 0.6.2

### Patch Changes

- 171abf8: Make PDA null if PDA hook is null
- Updated dependencies [9bd8013]
  - @macalinao/gill-extra@0.1.0

## 0.6.1

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages
- Updated dependencies [481456c]
  - @macalinao/solana-batch-accounts-loader@0.2.6
  - @macalinao/gill-extra@0.0.8

## 0.6.0

### Minor Changes

- 7300702: Fix bugs around quarry merge miner initialization, more pda hooks

## 0.5.14

### Patch Changes

- 42846e7: Dependency bumps
- Updated dependencies [42846e7]
  - @macalinao/gill-extra@0.0.7
  - @macalinao/zod-solana@0.1.7

## 0.5.13

### Patch Changes

- b0a90a2: Add re-exports from Gill
- Updated dependencies [b0a90a2]
  - @macalinao/gill-extra@0.0.6

## 0.5.12

### Patch Changes

- b577d51: Add support for multiple pdas/token accounts being fetched
- Updated dependencies [b577d51]
  - @macalinao/gill-extra@0.0.5
  - @macalinao/zod-solana@0.1.6

## 0.5.11

### Patch Changes

- 48ec0ee: Add staticTokenInfo prop

## 0.5.10

### Patch Changes

- Updated dependencies [3d64ada]
  - @macalinao/zod-solana@0.1.5
  - @macalinao/gill-extra@0.0.4

## 0.5.9

### Patch Changes

- aef5258: Update all dependencies
- Updated dependencies [aef5258]
  - @macalinao/gill-extra@0.0.3

## 0.5.8

### Patch Changes

- Updated dependencies [893371f]
  - @macalinao/gill-extra@0.0.2

## 0.5.7

### Patch Changes

- bf01031: Query key cleanup
- d6e8cfb: Grill hook client key cleanup
- Updated dependencies [3681f7a]
- Updated dependencies [ec4287f]
  - @macalinao/gill-extra@0.0.1

## 0.5.6

### Patch Changes

- d0e677b: Update dependencies, speed up linting

## 0.5.5

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/solana-batch-accounts-loader@0.2.5
  - @macalinao/dataloader-es@0.2.5
  - @macalinao/token-utils@0.1.8
  - @macalinao/zod-solana@0.1.4

## 0.5.4

### Patch Changes

- 67558f1: Add addresses to useAccount

## 0.5.3

### Patch Changes

- 1a5e0bd: Update dependencies
- aabb7d1: Add balance helpers
- Updated dependencies [1a5e0bd]
- Updated dependencies [3411158]
  - @macalinao/zod-solana@0.1.3
  - @macalinao/token-utils@0.1.7

## 0.5.2

### Patch Changes

- Updated dependencies [a9d96c1]
- Updated dependencies [e8cb12d]
  - @macalinao/token-utils@0.1.6

## 0.5.1

### Patch Changes

- 57adf4b: README license updates
- 04169c9: Add AccountInfo helper type
- e882c7d: Add transaction message encoder helpers
- Updated dependencies [57adf4b]
  - @macalinao/solana-batch-accounts-loader@0.2.4
  - @macalinao/dataloader-es@0.2.4
  - @macalinao/token-utils@0.1.5
  - @macalinao/zod-solana@0.1.2

## 0.5.0

### Minor Changes

- 9bc5c90: Breaking: Simplify useAccounts return type

### Patch Changes

- b3c1751: Dependency bumps
- Updated dependencies [9bc5c90]
- Updated dependencies [b3c1751]
  - @macalinao/token-utils@0.1.4
  - @macalinao/zod-solana@0.1.1

## 0.4.3

### Patch Changes

- 28b6a62: Add useAccounts hook for fetching multiple accounts

## 0.4.2

### Patch Changes

- 6ca32bc: Fix src/ not being included in packages
- Updated dependencies [6ca32bc]
- Updated dependencies [6eb3aa0]
  - @macalinao/token-utils@0.1.3

## 0.4.1

### Patch Changes

- Updated dependencies [912b622]
- Updated dependencies [5c893a9]
  - @macalinao/zod-solana@0.1.0

## 0.4.0

### Minor Changes

- 35a7d46: Use @macalinao/clients-token-metadata instead

## 0.3.2

### Patch Changes

- 64b4a18: Fix src/ directory not being included in Grill
- 4e5efaa: Clean up dependencies and peer dependencies
- 2cd4a4b: Move @types/bun into catalog
- Updated dependencies [4e5efaa]
- Updated dependencies [2cd4a4b]
  - @macalinao/solana-batch-accounts-loader@0.2.3
  - @macalinao/token-metadata-client@0.1.2
  - @macalinao/dataloader-es@0.2.3
  - @macalinao/zod-solana@0.0.5
  - @macalinao/token-utils@0.1.2

## 0.3.1

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges
- Updated dependencies [c7eb4a2]
  - @macalinao/solana-batch-accounts-loader@0.2.2
  - @macalinao/dataloader-es@0.2.2
  - @macalinao/token-utils@0.1.1
  - @macalinao/zod-solana@0.0.4

## 0.3.0

### Minor Changes

- 49c1d2c: Restructure sendTX types, add error toasts for transaction signing rejected

### Patch Changes

- 87c6415: Add support for token metadata fetching
- Updated dependencies [0d09839]
- Updated dependencies [5555546]
- Updated dependencies [87c6415]
  - @macalinao/token-metadata-client@0.1.1
  - @macalinao/zod-solana@0.0.3

## 0.2.3

### Patch Changes

- 26af4d0: Add address validator for Zod
- Updated dependencies [26af4d0]
  - @macalinao/zod-solana@0.0.2

## 0.2.2

### Patch Changes

- 0a3cfb6: Fix sonner peer dependency
- 78e247a: Support custom explorers (Solscan example)

## 0.2.1

### Patch Changes

- f450ea4: Re-release for fixed chagneset config
- Updated dependencies [f450ea4]
  - @macalinao/dataloader-es@0.2.1
  - @macalinao/solana-batch-accounts-loader@0.2.1

## 0.2.0

### Minor Changes

- 32cc1bb: Force republish
- c85a7ca: Refactor transaction sending

### Patch Changes

- Updated dependencies [32cc1bb]
  - @macalinao/dataloader-es@0.2.0
  - @macalinao/solana-batch-accounts-loader@0.2.0
