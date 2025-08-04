# Kite - Modern Solana Development Kit

A comprehensive toolkit for building Solana applications with React and [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2).

## Packages

### [@macalinao/kite](./packages/kite)
Complete toolkit that exports both kite-query and wallet-adapter functionality.

```bash
bun add @macalinao/kite
```

### [@macalinao/kite-query](./packages/kite-query)
Account caching and batched loading for React-based Solana applications, inspired by [@saberhq/sail](https://github.com/saber-hq/sail) but built for @solana/kit.

```bash
bun add @macalinao/kite-query
```

### [@macalinao/wallet-adapter](./packages/wallet-adapter)
Solana wallet adapter integration for @solana/kit with modern transaction handling.

```bash
bun add @macalinao/wallet-adapter
```

## Quick Start

```tsx
import { KiteProvider } from "@macalinao/kite";
import { createSolanaRpc } from "@solana/kit";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const endpoint = "https://api.mainnet-beta.solana.com";
const rpc = createSolanaRpc(endpoint);

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <KiteProvider rpc={rpc}>
              {/* Your app components */}
            </KiteProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

## Features

- 🚀 Built for [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2) (Solana Web3.js 2.0)
- ⚡ Efficient account batching and caching with React Query
- 🔐 Seamless wallet adapter integration
- 🎯 Type-safe transaction building
- 📦 Modern ESM package structure
- 🛠️ Full TypeScript support

## Development

This is a Bun monorepo using Turbo for task orchestration.

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Lint code
bun run lint
```

## License

Apache-2.0

## Author

Ian Macalinao <ian@macalinao.com>