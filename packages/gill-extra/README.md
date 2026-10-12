# @macalinao/gill-extra

Solana client utilities built on [@solana/kit](https://github.com/anza-xyz/kit), with no React dependencies.

## Installation

```bash
npm install @macalinao/gill-extra
# or
bun add @macalinao/gill-extra
```

## Features

- **Cluster URLs**: `getPublicSolanaRpcUrl` returns kit's branded public cluster URLs, ready for `solanaRpcConnection` from `@solana/kit-plugin-rpc`
- **Transaction simulation**: `simulateTransactionFactory` builds a simulate helper from an `rpc`
- **Transaction building**: `createTransaction` assembles a transaction message from instructions, a fee payer and optional compute budget settings
- **Zod schemas**: Type-safe Solana data validation from `@macalinao/zod-solana`
- **Transaction utilities**: Base64 encoding, transaction inspector URLs
- **Confirmation utilities**: `confirmTransaction` (WebSocket with polling fallback) and `pollTransactionConfirmation`, with configurable retries
- **Explorer utilities**: Generate Solscan explorer links for transactions, addresses, and blocks
- **Account utilities**: Batch account fetching and decoding helpers
- **Token utilities**: Re-exports from `@macalinao/token-utils`

## Usage

```typescript
import {
  createTransaction,
  getPublicSolanaRpcUrl,
  confirmTransaction,
  getSolscanExplorerLink,
  createTransactionInspectorUrl,
  fetchAndDecodeAccount,
  simulateTransactionFactory,
} from "@macalinao/gill-extra";
import { createClient } from "@solana/kit";
import { solanaRpcConnection } from "@solana/kit-plugin-rpc";

// A kit client with `rpc` and `rpcSubscriptions`.
const { rpc } = createClient().use(
  solanaRpcConnection({ rpcUrl: getPublicSolanaRpcUrl("mainnet") }),
);

const simulateTransaction = simulateTransactionFactory({ rpc });
```

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
