# @macalinao/das-api

A [Metaplex Digital Asset Standard (DAS) API](https://github.com/metaplex-foundation/digital-asset-standard-api) client for [`@solana/kit`](https://github.com/anza-xyz/kit) — **with no [`umi`](https://github.com/metaplex-foundation/umi) dependency**.

The official DAS API client is built on `umi`. This package is a clean-room port that speaks the same JSON-RPC protocol but is built entirely on `@solana/kit` primitives (`Rpc`, `RpcApi`, `Address`), so it drops straight into a modern kit/[gill](https://github.com/gillsdk/gill) stack. It also covers the [Helius DAS API](https://www.helius.dev/docs/api-reference/das) superset (`getAssetBatch`, `getAssetProofBatch`, `getSignaturesForAsset`, `getTokenAccounts`, `getNftEditions`).

## Installation

```bash
npm install @macalinao/das-api @solana/kit
# or
bun add @macalinao/das-api @solana/kit
```

`@solana/kit` is a peer dependency.

## Quick start

```typescript
import { address } from "@solana/kit";
import { createDasRpc } from "@macalinao/das-api";

// Point at any DAS-enabled RPC endpoint (Helius, Triton, etc.)
const das = createDasRpc("https://mainnet.helius-rpc.com/?api-key=YOUR_KEY");

const asset = await das
  .getAsset({ id: address("F9Lw3ki3hJ7PF9HQXsBzoY8GyE6sPoEZZdXJBsTTD2rk") })
  .send();

console.log(asset.content.metadata.name);
```

Every method returns a **pending request**; call `.send()` to execute it — matching the ergonomics of `@solana/kit`'s own RPC client. `.send()` accepts an optional `{ abortSignal }`:

```typescript
const asset = await das
  .getAsset({ id })
  .send({ abortSignal: AbortSignal.timeout(10_000) });
```

## Supported methods

| Method | Description |
| --- | --- |
| `getAsset` | Get a single asset by id. |
| `getAssetBatch` | Get multiple assets by id (Helius). |
| `getAssetProof` | Get a merkle proof for a compressed asset. |
| `getAssetProofBatch` | Get merkle proofs for multiple compressed assets (Helius). |
| `getAssetsByOwner` | List assets owned by an address. |
| `getAssetsByAuthority` | List assets controlled by an authority. |
| `getAssetsByCreator` | List assets created by an address. |
| `getAssetsByGroup` | List assets in a group (e.g. a collection). |
| `searchAssets` | Search assets by arbitrary criteria. |
| `getSignaturesForAsset` | Get the transaction signatures for an asset. |
| `getTokenAccounts` | Get token accounts by owner and/or mint (Helius). |
| `getNftEditions` | Get printed editions of a master edition NFT (Helius). |

### Examples

```typescript
import { address } from "@solana/kit";
import { createDasRpc } from "@macalinao/das-api";

const das = createDasRpc(RPC_URL);

// Paginated list of the NFTs owned by a wallet
const { items, total } = await das
  .getAssetsByOwner({
    ownerAddress: address("9WzD..."),
    page: 1,
    limit: 100,
    displayOptions: { showFungible: true, showNativeBalance: true },
  })
  .send();

// Search a collection for compressed NFTs
const results = await das
  .searchAssets({
    grouping: ["collection", "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w"],
    compressed: true,
    page: 1,
  })
  .send();

// Merkle proof for a compressed NFT
const proof = await das.getAssetProof({ id: assetId }).send();

// Token accounts for a mint (Helius)
const { token_accounts } = await das
  .getTokenAccounts({ mint: usdcMint, limit: 1000 })
  .send();
```

## Composing with gill / an existing transport

`createDasRpc` builds a default transport for you. If you already have a
`@solana/kit` transport (for example, to share connection pooling or custom
headers), use `createDasRpcFromTransport`:

```typescript
import { createDefaultRpcTransport } from "@solana/kit";
import { createDasRpcFromTransport } from "@macalinao/das-api";

const transport = createDefaultRpcTransport({
  url: RPC_URL,
  headers: { "x-api-key": "YOUR_KEY" },
});

const das = createDasRpcFromTransport(transport);
```

`gill`'s `createSolanaClient` exposes only the standard Solana JSON-RPC methods,
so run a DAS client alongside it, pointed at the same DAS-enabled URL:

```typescript
import { createSolanaClient } from "gill";
import { createDasRpc } from "@macalinao/das-api";

const { rpc } = createSolanaClient({ urlOrMoniker: RPC_URL });
const das = createDasRpc(RPC_URL);

const { value: blockhash } = await rpc.getLatestBlockhash().send();
const asset = await das.getAsset({ id }).send();
```

## Advanced: building the API yourself

The lower-level building blocks are exported if you want to assemble the RPC
client manually or share the API definition:

```typescript
import { createRpc, createDefaultRpcTransport } from "@solana/kit";
import { createDasApi } from "@macalinao/das-api";

const das = createRpc({
  api: createDasApi(),
  transport: createDefaultRpcTransport({ url: RPC_URL }),
});
```

`createDasApi()` returns an `RpcApi<SolanaDasApi>` that:

- unwraps the single method argument into JSON-RPC **named parameters**
  (`params: { id }` rather than `params: [{ id }]`), as DAS endpoints expect; and
- unwraps the JSON-RPC envelope on the way back, throwing a `DasApiError` on
  error responses and returning `result` otherwise.

## Error handling

When an endpoint returns a JSON-RPC error, the request rejects with a
`DasApiError` carrying the `code`, `message`, and any provider-specific `data`:

```typescript
import { DasApiError } from "@macalinao/das-api";

try {
  await das.getAsset({ id }).send();
} catch (error) {
  if (error instanceof DasApiError) {
    console.error(error.code, error.message);
  }
}
```

## Types

All request and response types are exported and fully documented, including the
Helius extensions (`token_info`, `mint_extensions`, `inscription`, `nativeBalance`,
and more). Addresses are typed as the branded `Address` type from `@solana/kit`.

```typescript
import type {
  DasApiAsset,
  DasApiAssetList,
  GetAssetsByOwnerRequest,
  SearchAssetsRequest,
  SolanaDasApi,
} from "@macalinao/das-api";
```

## Zod schemas

Every response type has a matching [Zod](https://zod.dev) schema, useful when you
want to validate what an indexer actually sent you (they are, after all, third
parties) or when you are parsing DAS payloads that did not come from this client
— a cache, a webhook, a fixture file:

```typescript
import { dasApiAssetSchema, dasApiAssetListSchema } from "@macalinao/das-api";

const asset = dasApiAssetSchema.parse(await response.json());
//    ^? DasApiAsset — addresses parsed into branded `Address`es

const result = dasApiAssetListSchema.safeParse(payload);
if (!result.success) {
  console.error(result.error.issues);
}
```

Each schema's output type is the interface of the same name, enforced at compile
time, so a schema can never drift from the type it validates. The top-level
schemas are `dasApiAssetSchema`, `dasApiAssetListSchema`,
`getAssetProofResponseSchema`, `getAssetProofBatchResponseSchema`,
`getSignaturesForAssetResponseSchema`, `getTokenAccountsResponseSchema`, and
`getNftEditionsResponseSchema`; every nested type (`dasApiAssetContentSchema`,
`dasApiTokenInfoSchema`, `dasApiMintExtensionsSchema`, …) is exported too, so you
can validate a fragment or compose your own.

Two deliberate concessions to how indexers really behave:

- **Unknown keys are preserved, not stripped.** Providers add fields faster than
  any type definition tracks them, so a `parse` will not silently drop data it
  does not know about.
- **Compression hashes accept the empty string.** Indexers return `""` for
  `data_hash`, `creator_hash`, `asset_hash`, and `tree` on assets that are not
  compressed, so validating those as addresses would reject every regular NFT.

`zod` is a peer dependency. The schemas are re-exported from the package root, so
`zod` is loaded whenever `@macalinao/das-api` is imported — install it alongside
this package.

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
