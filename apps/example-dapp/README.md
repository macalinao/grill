# Grill Example DApp

A modern Solana application demonstrating the Grill toolkit's capabilities for efficient blockchain interactions with automatic account batching and caching.

## Overview

This example showcases how to build a Solana dApp using:

- **Grill** - React provider for automatic account batching with DataLoader
- **Gill** - Modern Solana client library
- **React Query** - Powerful data fetching and caching
- **Tailwind CSS v4** - Utility-first styling with shadcn/ui components
- **TanStack Router** - Type-safe routing

## Features

- 🚀 **Automatic Account Batching** - Multiple account requests are automatically batched into single RPC calls
- 💾 **Smart Caching** - React Query integration for intelligent data caching
- 🔐 **Wallet Integration** - Support for all major Solana wallets via @solana/wallet-adapter
- 🎨 **Modern UI** - Beautiful interface with dark mode support
- ⚡ **Fast Development** - Vite + Bun for lightning-fast builds

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2.19 or higher
- Node.js 18+ (for compatibility)

### Installation

```bash
# From the monorepo root
bun install
bun run build

# Run the example app
cd apps/example-dapp
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Architecture

### Provider Setup

The app uses a carefully orchestrated provider hierarchy in `App.tsx`:

```tsx
QueryClientProvider         // React Query for caching
  → SolanaProvider          // Gill client for RPC
    → ConnectionProvider    // Wallet adapter connection
      → WalletProvider      // Wallet management
        → WalletModalProvider
          → GrillProvider   // Account batching with DataLoader
```

### Key Components

#### GrillProvider

Creates a DataLoader instance for batching account fetches. When multiple components request account data simultaneously, these requests are automatically batched into efficient RPC calls.

#### SimpleDashboard

Demonstrates core functionality:

- Wallet connection and balance display
- Account data fetching with automatic batching
- Direct RPC calls using the gill client
- Real-time balance updates

## Usage Examples

### Fetching Account Data

```typescript
import { useAccount } from "@macalinao/grill";

function MyComponent() {
  // Automatically batched with other account requests
  const { data: account, isLoading, refetch } = useAccount(publicKey);

  if (isLoading) return <div>Loading...</div>;
  if (!account) return <div>Account not found</div>;

  return (
    <div>
      <p>Balance: {Number(account.lamports) / 1e9} SOL</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Using the Wallet

```typescript
import { useKitWallet } from "@macalinao/grill";

function WalletInfo() {
  const { signer, rpc } = useKitWallet();

  if (!signer) {
    return <div>Please connect your wallet</div>;
  }

  return <div>Connected: {signer.address}</div>;
}
```

### Making RPC Calls

```typescript
import { useSolanaClient } from "@gillsdk/react";

function SlotDisplay() {
  const { rpc } = useSolanaClient();

  const fetchSlot = async () => {
    const slot = await rpc.getSlot().send();
    console.log("Current slot:", slot);
  };

  return <button onClick={fetchSlot}>Get Slot</button>;
}
```

## Project Structure

```
example-dapp/
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   ├── ui/            # Reusable UI components
│   │   ├── SimpleDashboard.tsx
│   │   └── theme-toggle.tsx
│   ├── routes/            # TanStack Router pages
│   │   ├── index.tsx      # Home page
│   │   └── examples/      # Example pages
│   ├── App.tsx           # Provider setup
│   └── main.tsx         # Entry point
├── vite.config.ts       # Vite configuration
└── tailwind.config.ts   # Tailwind v4 config
```

## Available Scripts

```bash
# Development
bun run dev        # Start dev server on port 5173
bun run build      # Build for production
bun run preview    # Preview production build

# Code Quality
bun run typecheck  # Check TypeScript types (lint runs from the repo root: bun run lint)
```

## Examples Section

The app includes several examples accessible through the sidebar:

- **Dashboard** - Basic wallet connection and balance display
- **Wrapped SOL** - Token operations with automatic batching
- More examples coming soon!

## Technologies

- **React 19** - Latest React with improved performance
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast HMR and builds
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Powerful data synchronization
- **Tailwind CSS v4** - Modern styling
- **shadcn/ui** - Beautiful, accessible components
- **oxlint + oxfmt** - Fast linting and formatting

## Learn More

- [Grill Documentation](https://github.com/macalinao/grill)
- [Gill Documentation](https://github.com/gillsdk/gill)
- [Solana Kit](https://github.com/solana-developers/solana-kit)
- [React Query](https://tanstack.com/query)

## Contributing

This is an example application demonstrating Grill's capabilities. Feel free to use it as a template for your own Solana applications!

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
