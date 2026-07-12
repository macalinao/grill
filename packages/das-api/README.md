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

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
