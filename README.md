# Grill - Modern Solana Development Kit

[![npm version](https://img.shields.io/npm/v/@macalinao/grill.svg)](https://www.npmjs.com/package/@macalinao/grill)

A comprehensive toolkit for building Solana applications with React, featuring automatic account batching, type-safe account decoding, and seamless transaction management. Built on top of [gill](https://github.com/DecalLabs/gill) and [@solana/kit](https://github.com/anza-xyz/kit).

## Packages

### [@macalinao/grill](./packages/grill)

React provider for Solana account management with automatic batching and caching, built on top of @gillsdk/react.

```bash
bun add @macalinao/grill @gillsdk/react gill
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
import { WalletAdapterCompatProvider } from "@macalinao/wallet-adapter-compat";
import { createSolanaClient } from "gill";
import { SolanaProvider } from "@gillsdk/react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({ urlOrMoniker: "mainnet-beta" });

function App() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider client={solanaClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <WalletAdapterCompatProvider>
                <GrillProvider>
                  {/* Your app components */}
                  <Toaster position="bottom-right" />
                </GrillProvider>
              </WalletAdapterCompatProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
}
```

## Core Features

### 🎯 Automatic Account Batching

Multiple account requests are automatically batched into single RPC calls:

```tsx
import { useAccount, useAssociatedTokenAccount } from "@macalinao/grill";

function Dashboard() {
  // All these requests are batched into 1 RPC call!
  const { data: userAccount } = useAccount({
    address: userAddress,
  });

  const { data: usdcAccount } = useAssociatedTokenAccount({
    mint: USDC_MINT,
    owner: userAddress,
  });

  const { data: solAccount } = useAccount({
    address: poolAddress,
  });
}
```

### 🔄 Simple Transaction Management

Send transactions with automatic status notifications:

```tsx
import { useSendTX, useKitWallet } from "@macalinao/grill";

function SwapButton() {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  const handleSwap = async () => {
    const instructions = buildSwapInstructions();
    await sendTX("Swap USDC for SOL", instructions);
    // Automatic toast notifications for each stage!
  };

  return <button onClick={handleSwap}>Swap</button>;
}
```

### 📖 Type-Safe Account Decoding

```tsx
import { useAccount } from "@macalinao/grill";
import { getTokenAccountDecoder } from "@solana-program/token";

function TokenBalance({ tokenAccountAddress }) {
  const { data: account } = useAccount({
    address: tokenAccountAddress,
    decoder: getTokenAccountDecoder(),
  });

  // account.data is fully typed as TokenAccount!
  return <div>Balance: {account?.data.amount.toString()}</div>;
}
```

## Why Grill?

Traditional Solana development suffers from the N+1 query problem. Every component that needs account data makes its own RPC request. Grill solves this with automatic batching using the DataLoader pattern from GraphQL.

**Without Grill:** 10 components = 10 RPC calls = Rate limiting & slow UX  
**With Grill:** 10 components = 1 batched RPC call = Fast & efficient

## Key Benefits

- ⚡ **10x fewer RPC calls** through automatic batching
- 🎯 **Type-safe everything** - accounts, transactions, PDAs
- 🔄 **Automatic cache management** with React Query
- 🎨 **Beautiful transaction UX** with toast notifications
- 🏗️ **Incremental migration** - works alongside existing code
- 📦 **Modern stack** - Built on @solana/kit and gill

## Works Great With

### [@macalinao/coda](https://github.com/macalinao/coda)

Grill pairs perfectly with **Coda**, our automated client generation tool for Solana programs. While Grill handles efficient account fetching and transaction management, Coda generates type-safe TypeScript clients from your Anchor IDLs automatically.

Together they provide:

- **Zero boilerplate**: Coda generates the program clients, Grill batches the account fetches
- **End-to-end type safety**: From IDL to UI components
- **Automatic synchronization**: Keep your clients in sync with on-chain programs
- **Production-ready code**: Both tools generate code that's ready for production use

```bash
# Generate type-safe clients with Coda
coda generate

# Use the generated clients with Grill's batching
import { useAccount } from "@macalinao/grill";
import { getMyProgramDecoder } from "./generated/myProgram";

function MyComponent() {
  const { data } = useAccount({
    address: programAccountAddress,
    decoder: getMyProgramDecoder() // Generated by Coda!
  });
  // Fully typed account data with automatic batching
}
```

## Documentation

Check out the comprehensive guides in [`docs/grill/`](./docs/grill/):

1. [**Introduction**](./docs/grill/01-intro.md) - Why Grill and the core concepts
2. [**Setup & Migration**](./docs/grill/02-setup.md) - Installation and incremental migration
3. [**Reading Accounts**](./docs/grill/03-accounts.md) - Efficient account fetching with batching
4. [**Making Transactions**](./docs/grill/04-transactions.md) - Clean transaction management
5. [**Advanced Patterns**](./docs/grill/05-patterns.md) - Production patterns and best practices

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

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
