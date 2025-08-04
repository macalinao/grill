# @macalinao/batch-accounts-loader

Efficient batch account loading for Solana using DataLoader and [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2).

## Installation

```bash
bun add @macalinao/batch-accounts-loader
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
import { BatchAccountsLoader } from "@macalinao/batch-accounts-loader";
import { createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

const loader = new BatchAccountsLoader({
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

const results = await loader.loadMany(accountIds);

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

BatchAccountsLoader uses DataLoader to automatically batch multiple account requests into efficient `getMultipleAccounts` RPC calls. When you call `load()` or `loadMany()`, the loader:

1. Collects all requests made within the same tick
2. Groups them into batches (respecting `maxBatchSize`)
3. Makes a single RPC call per batch
4. Caches results to prevent duplicate requests
5. Returns individual results to each caller

This pattern significantly reduces RPC calls and improves performance when loading many accounts.

## API Reference

### `BatchAccountsLoader`

#### Constructor Options

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

#### Methods

- `load(accountId: Address): Promise<AccountInfo | null>` - Load a single account
- `loadMany(accountIds: Address[]): Promise<(AccountInfo | null | Error)[]>` - Load multiple accounts
- `clear(accountId: Address): void` - Clear specific account from cache
- `clearAll(): void` - Clear all cached accounts
- `prime(accountId: Address, value: AccountInfo | null): void` - Prime cache with a value

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