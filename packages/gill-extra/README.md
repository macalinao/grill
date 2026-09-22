# @macalinao/gill-extra

Solana client utilities built on [@solana/kit](https://github.com/anza-xyz/kit), with no React dependencies.

## Installation

```bash
npm install @macalinao/gill-extra
# or
bun add @macalinao/gill-extra
```

## Features

- **Solana client**: `createSolanaClient` builds an `rpc`/`rpcSubscriptions` pair with transaction send and simulate helpers
- **Transaction building**: `createTransaction` assembles a transaction message from instructions, a fee payer and optional compute budget settings
- **Zod schemas**: Type-safe Solana data validation from `@macalinao/zod-solana`
- **Transaction utilities**: Base64 encoding, transaction inspector URLs, signature conversion
- **Polling utilities**: Transaction confirmation polling with configurable retries
- **Explorer utilities**: Generate Solscan explorer links for transactions, addresses, and blocks
- **Account utilities**: Batch account fetching and decoding helpers
- **Token utilities**: Re-exports from `@macalinao/token-utils`

## Usage

```typescript
import {
  createSolanaClient,
  createTransaction,
  SolanaClient,
  pollConfirmTransaction,
  getSolscanExplorerLink,
  createTransactionInspectorUrl,
  fetchAndDecodeAccount,
} from "@macalinao/gill-extra";
```

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
