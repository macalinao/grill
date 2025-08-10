# Grill - Modern Solana Development Kit

A comprehensive toolkit for building Solana applications with React, featuring automatic account batching and caching.

## Packages

### [@macalinao/grill](./packages/grill)
React provider for Solana account management with automatic batching and caching, built on top of gill-react.

```bash
bun add @macalinao/grill gill-react gill
```

### [@macalinao/solana-batch-accounts-loader](./packages/solana-batch-accounts-loader)
DataLoader implementation for batching Solana account fetches.

```bash
bun add @macalinao/solana-batch-accounts-loader
```

### [@macalinao/wallet-adapter-compat](./packages/wallet-adapter-compat)
Compatibility layer between @solana/wallet-adapter and @solana/kit.

```bash
bun add @macalinao/wallet-adapter-compat
```

### [@macalinao/dataloader-es](./packages/dataloader-es)
ES module compatible DataLoader implementation.

```bash
bun add @macalinao/dataloader-es
```

## Quick Start

```tsx
import { GrillProvider } from "@macalinao/grill";
import { createSolanaClient } from "gill";
import { SolanaProvider } from "gill-react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({ urlOrMoniker: "mainnet-beta" });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider client={solanaClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <GrillProvider>
                {/* Your app components */}
              </GrillProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
}
```

## Using Grill

```tsx
import { useAccount } from "@macalinao/grill";

function MyComponent() {
  const { data: account, isLoading, error } = useAccount('So11111111111111111111111111111111111111112');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!account) return <div>Account not found</div>;

  return (
    <div>
      <p>Owner: {account.owner}</p>
      <p>Lamports: {account.lamports}</p>
    </div>
  );
}
```

## Features

- 🚀 Built on gill and gill-react for modern Solana development
- ⚡ Automatic account batching - multiple concurrent requests are batched into single RPC calls
- 📊 React Query integration for caching and state management
- 🔐 Seamless wallet adapter integration
- 🎯 Type-safe with full TypeScript support
- 📦 Modern ESM package structure

## Architecture

Grill provides a `GrillProvider` that creates a DataLoader for batching account requests. When multiple components request account data simultaneously, Grill automatically batches these requests into a single RPC call, significantly improving performance.

The `useAccount` hook integrates with React Query to provide:
- Automatic caching with configurable stale times
- Background refetching
- Loading and error states
- Manual refetch capabilities

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