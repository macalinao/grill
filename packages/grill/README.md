# @macalinao/grill

React provider and hooks for Solana development with automatic account batching and Kit wallet integration.

## Purpose

Grill provides two main features:

1. **Account Batching**: Automatically batches multiple account requests into single RPC calls using DataLoader
2. **Kit Wallet Integration**: Provides wallet context and hooks for @solana/kit's TransactionSendingSigner

## Installation

```bash
npm install @macalinao/grill gill-react gill
```

## Usage

### Account Batching with GrillProvider

```tsx
import { GrillProvider, useAccount } from '@macalinao/grill';
import { SolanaProvider } from 'gill-react';
import { createSolanaClient } from 'gill';

const client = createSolanaClient({ urlOrMoniker: 'mainnet-beta' });

function App() {
  return (
    <SolanaProvider client={client}>
      <GrillProvider>
        {/* Your app */}
      </GrillProvider>
    </SolanaProvider>
  );
}

function MyComponent() {
  // This will be batched with other concurrent account requests
  const { data: account, isLoading } = useAccount('So11111111111111111111111111111111111111112');
  
  if (isLoading) return <div>Loading...</div>;
  if (!account) return <div>No account found</div>;
  
  return <div>Balance: {Number(account.lamports) / 1e9} SOL</div>;
}
```

### Kit Wallet Integration with WalletProvider

```tsx
import { WalletProvider, useKitWallet, useTransactionSendingSigner } from '@macalinao/grill';
import type { TransactionSendingSigner } from '@solana/kit';

// Provide a TransactionSendingSigner and RPC endpoint
function App({ signer }: { signer: TransactionSendingSigner | null }) {
  return (
    <WalletProvider signer={signer} rpcEndpoint="https://api.mainnet-beta.solana.com">
      <MyComponent />
    </WalletProvider>
  );
}

function MyComponent() {
  const { signer, rpc } = useKitWallet();
  const transactionSigner = useTransactionSendingSigner();
  
  if (!signer) {
    return <div>Please connect your wallet</div>;
  }
  
  // Use signer for transactions
  // Use rpc for queries
}
```

## API

### Providers

- `GrillProvider` - Enables account batching with DataLoader
- `WalletProvider` - Provides Kit wallet context

### Hooks

- `useAccount(address: string)` - Fetch account data with automatic batching
- `useKitWallet()` - Access wallet context (signer, rpc, rpcEndpoint)
- `useTransactionSendingSigner()` - Get the transaction signer (nullable)
- `useRequiredTransactionSendingSigner()` - Get the transaction signer (throws if null)

## Features

- 🚀 Automatic request batching for improved performance
- 📊 React Query integration for caching
- 🔐 Type-safe Kit wallet integration
- ⚡ Optimized for concurrent account fetches

## License

Apache-2.0