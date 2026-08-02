# @macalinao/das-api

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
