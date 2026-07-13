---
"@macalinao/das-api": minor
---

Add `@macalinao/das-api`, a Metaplex Digital Asset Standard (DAS) API client for `@solana/kit` with no `umi` dependency.

- Kit-native `Rpc<SolanaDasApi>` client via `createDasRpc(url)` / `createDasRpcFromTransport(transport)`, plus a `createDasApi()` `RpcApi` factory for manual composition.
- Covers the Metaplex DAS methods and the Helius superset: `getAsset`, `getAssetBatch`, `getAssetProof`, `getAssetProofBatch`, `getAssetsByOwner`, `getAssetsByAuthority`, `getAssetsByCreator`, `getAssetsByGroup`, `searchAssets`, `getSignaturesForAsset`, `getTokenAccounts`, and `getNftEditions`.
- Fully typed request/response models (including Helius extensions like `token_info`, `mint_extensions`, `inscription`, and `nativeBalance`) with addresses typed as `@solana/kit`'s branded `Address`.
- Throws a typed `DasApiError` on JSON-RPC error responses.
- Zod schemas for every response type (`dasApiAssetSchema`, `dasApiAssetListSchema`, `getAssetProofResponseSchema`, `getTokenAccountsResponseSchema`, and every nested type), whose output types are compile-time locked to the interfaces they validate. Schemas preserve unknown provider fields and tolerate the empty-string compression hashes that indexers return for uncompressed assets. `zod` is a peer dependency.
