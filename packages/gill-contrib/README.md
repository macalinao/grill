# @macalinao/gill-contrib

Additional utilities for [Gill](https://github.com/DecalLabs/gill) - a modern Solana client library.

## Installation

```bash
npm install @macalinao/gill-contrib
# or
bun add @macalinao/gill-contrib
```

## Features

This package re-exports everything from `gill` and adds additional utilities:

- **All Gill exports**: Complete Solana client library functionality
- **Zod schemas**: Type-safe Solana data validation from `@macalinao/zod-solana`
- **Transaction utilities**: Base64 encoding, transaction inspector URLs, signature conversion
- **Polling utilities**: Transaction confirmation polling with configurable retries
- **Explorer utilities**: Generate Solscan explorer links for transactions, addresses, and blocks
- **Account utilities**: Batch account fetching and decoding helpers
- **Token utilities**: Re-exports from `@macalinao/token-utils`

## Usage

```typescript
import {
  // All gill exports are available
  createTransaction,
  SolanaClient,
  // Plus additional utilities
  pollConfirmTransaction,
  getSolscanExplorerLink,
  createTransactionInspectorUrl,
  fetchAndDecodeAccount,
} from "@macalinao/gill-contrib";
```

## License

MIT
