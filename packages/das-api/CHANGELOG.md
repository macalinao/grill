# @macalinao/das-api

## 0.3.0

### Minor Changes

- c715d97: Add support for Solana v1 transactions, and require `@solana/kit` 8.
  
  - **Breaking:** the `@solana/kit` peer dependency is now `^8` (was `^6 || ^7 || ^8`) in every package. The v1 transaction APIs used here were added in kit 8.
  - `createTransaction` (`@macalinao/gill-extra`) accepts `version: 1`. The compute budget is now set with kit's version-aware setters: legacy and v0 transactions still get Compute Budget instructions placed before your instructions, and v1 transactions get the same values in `message.config`.
  - New `createTransaction` options: `priorityFeeLamports`, the total priority fee in lamports (v1 only), and `loadedAccountsDataSizeLimit` (any version).
  - `createTransaction` now throws on invalid combinations. With version 1, both `computeUnitLimit` and `loadedAccountsDataSizeLimit` are required, because an unset value budgets zero compute units or zero bytes and the transaction would fail. `computeUnitPrice` is rejected for v1 (use `priorityFeeLamports`), and `priorityFeeLamports` is rejected for legacy and v0 (use `computeUnitPrice`). `version: "auto"` still only picks legacy or v0.
  - `BuildTXOptions`, shared by `SendTXOptions` and `SignTXOptions` in `@macalinao/grill`, adds `version` (default `0`, as before), `priorityFeeLamports` and `loadedAccountsDataSizeLimit`. Both `useSendTX` and `useSignTX` build v1 transactions. `lookupTables` is only allowed with version 0. If the options are invalid, the send or sign fails with an error status event rather than leaving the toast on "preparing".
  - `getConfirmedTransaction` requests `maxSupportedTransactionVersion: 1`, so it can fetch v1 transactions.
  - `@macalinao/wallet-adapter-compat` rejects v1 transactions with a clear error, whether they are being sent or only signed. Wallet adapters take `@solana/web3.js` transactions, and web3.js can parse v1 messages but cannot serialize them. Send v1 transactions through a Wallet Standard or kit signer.
  - `@solana-program/compute-budget` is no longer a runtime dependency of `@macalinao/gill-extra`.

### Patch Changes

- Updated dependencies [c715d97]
  - @macalinao/zod-solana@0.6.0

## 0.2.3

### Patch Changes

- 7b8d812: Update dependencies:
  
  - `@solana/kit` to `^8.3.0` and `@solana/webcrypto-ed25519-polyfill` to `8.3.0` (`@macalinao/wallet-adapter-compat`). The `@solana/kit` peer range stays `^6 || ^7 || ^8`.
  - `@solana-programs/token-metadata` to `^0.8.0` (`@macalinao/gill-extra`, `@macalinao/grill`) and `@solana-programs/quarry` to `^0.7.0` (`@macalinao/quarry`).
  - `@solana/wallet-adapter-base` to `^0.9.28` and `@solana/wallet-adapter-react` to `^0.15.40` (`@macalinao/wallet-adapter-compat` peer deps), plus `@solana/web3.js` to `^1.99.0` for development.
  - `zod` to `^4.6.5` (`@macalinao/das-api`, `@macalinao/zod-solana`). The `zod` peer range stays `^4`.
  - React 19.3 and its type packages, and build tooling: `tsdown` to `^0.23.0`, `@types/bun` to `^1.4.2`.
- Updated dependencies [7b8d812]
  - @macalinao/zod-solana@0.5.2

## 0.2.2

### Patch Changes

- 8501dce: Update dependencies to their latest versions:
  
  - Move to `@solana/kit` v8. The `@solana/kit` peer range widens to `^6 || ^7 || ^8`, so v7 consumers are unaffected.
  - Migrate the Codama-generated program clients to their new `@solana-programs/*` scope: `@macalinao/clients-quarry` becomes `@solana-programs/quarry`, `@macalinao/clients-token-metadata` becomes `@solana-programs/token-metadata`, and `@macalinao/clients-meteora-damm-v2` becomes `@solana-programs/meteora-damm-v2`. The packages are identical apart from the name, so the generated types and instruction builders `@macalinao/quarry` re-exports are unchanged.
  - Bump the SPL program clients that kit v8 requires: `@solana-program/system` to `^0.14.1`, `@solana-program/address-lookup-table` to `^0.14.1`, `@solana-program/token` to `^0.16.1`, and `@solana/webcrypto-ed25519-polyfill` to `8.2.0`.
  - Bump `@tanstack/react-query` to `^5.102.8`, `zod` to `^4.5.4`, and the React 19 type packages.
- Updated dependencies [8501dce]
  - @macalinao/zod-solana@0.5.1

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
