# @macalinao/solana-batch-accounts-loader

Efficient batch account loading for Solana using DataLoader and [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2).

## Installation

```bash
bun add @macalinao/solana-batch-accounts-loader
```

## Features

- ⚡ Automatic request batching with DataLoader
- 🔄 Configurable batch sizes (default: 100 accounts)
- 📦 Built-in caching to prevent duplicate requests
- 🛡️ Type-safe with full TypeScript support
- 🎯 Optimized for @solana/kit RPC

## Usage

### Basic Setup

```typescript
import { createBatchAccountsLoader } from "@macalinao/batch-accounts-loader";
import { createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

const loader = createBatchAccountsLoader({
  rpc,
  commitment: "confirmed",
  maxBatchSize: 100, // Optional, defaults to 100
});
```

### Loading Single Account

```typescript
import { address } from "@solana/kit";

const accountId = address("11111111111111111111111111111111");
const accountInfo = await loader.load(accountId);

if (accountInfo) {
  console.log("Owner:", accountInfo.owner);
  console.log("Lamports:", accountInfo.lamports);
  console.log("Executable:", accountInfo.executable);
}
```

### Loading Multiple Accounts

```typescript
const accountIds = [
  address("11111111111111111111111111111111"),
  address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  address("So11111111111111111111111111111111111111112"),
];

// Convert addresses to strings for the loader
const results = await loader.loadMany(accountIds.map(String));

results.forEach((result, index) => {
  if (result instanceof Error) {
    console.error(`Failed to load ${accountIds[index]}:`, result);
  } else if (result) {
    console.log(`Account ${accountIds[index]} has ${result.lamports} lamports`);
  } else {
    console.log(`Account ${accountIds[index]} not found`);
  }
});
```

### Cache Management

```typescript
// Clear specific account from cache
loader.clear(accountId);

// Clear all cached accounts
loader.clearAll();

// Prime the cache with a known value
loader.prime(accountId, accountInfo);
```

## How It Works

The `createBatchAccountsLoader` function creates a DataLoader instance that automatically batches multiple account requests into efficient `getMultipleAccounts` RPC calls. When you call `load()` or `loadMany()`, the loader:

1. Collects all requests made within a 10ms window
2. Groups them into batches (respecting `maxBatchSize`)
3. Makes a single RPC call per batch
4. Caches results to prevent duplicate requests
5. Returns individual results to each caller

This pattern significantly reduces RPC calls and improves performance when loading many accounts.

## API Reference

### `createBatchAccountsLoader(config)`

Creates a DataLoader instance for batching Solana account fetches.

#### Parameters

```typescript
interface BatchAccountsLoaderConfig {
  rpc: Rpc<GetMultipleAccountsApi>;
  commitment?: "confirmed" | "finalized";
  maxBatchSize?: number;
}
```

- `rpc` - Solana RPC client from @solana/kit
- `commitment` - Commitment level for queries (default: "confirmed")
- `maxBatchSize` - Maximum accounts per RPC call (default: 100)

#### Returns

Returns a `DataLoader<string, AccountInfo | null>` with the following methods:

- `load(key: string): Promise<AccountInfo | null>` - Load a single account
- `loadMany(keys: string[]): Promise<(AccountInfo | null | Error)[]>` - Load multiple accounts
- `clear(key: string): DataLoader` - Clear specific account from cache
- `clearAll(): DataLoader` - Clear all cached accounts
- `prime(key: string, value: AccountInfo | null): DataLoader` - Prime cache with a value

### `AccountInfo`

```typescript
interface AccountInfo {
  readonly data: string; // Base64 encoded account data
  readonly executable: boolean;
  readonly lamports: bigint;
  readonly owner: Address;
  readonly rentEpoch?: bigint;
}
```

## License

Apache-2.0