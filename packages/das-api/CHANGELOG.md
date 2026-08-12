# @macalinao/das-api

## 0.2.1

### Patch Changes

- Updated dependencies [2d68f3c]
- Updated dependencies [60965e2]
  - @macalinao/zod-solana@0.5.0

## 0.2.0

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

### Patch Changes

- Updated dependencies [548a2d6]
  - @macalinao/zod-solana@0.4.0

## 0.1.1

### Patch Changes

- b009fb2: Upgrade `@macalinao/tsconfig` to v4, which turns on `exactOptionalPropertyTypes` (plus `allowImportingTsExtensions`, `rewriteRelativeImportExtensions` and `moduleDetection: "force"`) in the base config.

  Optional properties on public option bags and DAS API response types are now declared as `?: T | undefined` rather than `?: T`. This matches what the zod schemas actually produce and what callers forwarding an optional value actually pass; it widens the accepted input, so it is not a breaking change for consumers.

  `tsconfig.strict.json` drops `erasableSyntaxOnly`, `noImplicitReturns` and `noUncheckedSideEffectImports`, which the v4 base config now enables on its own.

  `bunfig.toml` exempts `@macalinao/tsconfig` from the 7-day `minimumReleaseAge` soak. It is a first-party package, so the soak buys nothing; the 7-day default still applies to every other dependency.

- Updated dependencies [b009fb2]
  - @macalinao/zod-solana@0.3.2

## 0.1.0

### Minor Changes

- b219e63: Add `@macalinao/das-api`, a Metaplex Digital Asset Standard (DAS) API client for `@solana/kit` with no `umi` dependency.

  - Kit-native `Rpc<SolanaDasApi>` client via `createDasRpc(url)` / `createDasRpcFromTransport(transport)`, plus a `createDasApi()` `RpcApi` factory for manual composition.
  - Covers the Metaplex DAS methods and the Helius superset: `getAsset`, `getAssetBatch`, `getAssetProof`, `getAssetProofBatch`, `getAssetsByOwner`, `getAssetsByAuthority`, `getAssetsByCreator`, `getAssetsByGroup`, `searchAssets`, `getSignaturesForAsset`, `getTokenAccounts`, and `getNftEditions`.
  - Fully typed request/response models (including Helius extensions like `token_info`, `mint_extensions`, `inscription`, and `nativeBalance`) with addresses typed as `@solana/kit`'s branded `Address`.
  - Throws a typed `DasApiError` on JSON-RPC error responses.
  - Zod schemas for every response type (`dasApiAssetSchema`, `dasApiAssetListSchema`, `getAssetProofResponseSchema`, `getTokenAccountsResponseSchema`, and every nested type), whose output types are compile-time locked to the interfaces they validate. Schemas preserve unknown provider fields and tolerate the empty-string compression hashes that indexers return for uncompressed assets. `zod` is a peer dependency.

### Patch Changes

- 2a0be1d: Fix correctness issues surfaced by stricter type-aware lint rules.

  - `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
  - `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
  - `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
  - `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
  - `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.

- Updated dependencies [9a97870]
  - @macalinao/zod-solana@0.3.1
