# @macalinao/grill

[![npm version](https://img.shields.io/npm/v/@macalinao/grill.svg)](https://www.npmjs.com/package/@macalinao/grill)

Modern Solana development kit for React applications with automatic account batching, caching, and transaction notifications.

## Features

- 🚀 **Automatic Account Batching**: Coalesces multiple account requests into single RPC calls
- 💾 **Smart Caching**: Integrated with React Query for intelligent cache management
- 🔔 **Transaction Notifications**: Built-in toast notifications for transaction status updates via Sonner
- 🔐 **Modern Wallet Integration**: Full support for @solana/kit wallet standard
- ⚡ **Performance Optimized**: Reduces RPC calls and improves app responsiveness
- 🎨 **Headless Option**: Use GrillHeadlessProvider for custom UI implementations

## Installation

```bash
npm install @macalinao/grill sonner
# or
yarn add @macalinao/grill sonner
# or
bun add @macalinao/grill sonner
```

## Quick Start

### 1. Set up the provider hierarchy

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "gill-react";
import { GrillProvider } from "@macalinao/grill";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <GrillProvider>
          {/* Your app components */}
        </GrillProvider>
        <Toaster />
      </SolanaProvider>
    </QueryClientProvider>
  );
}
```

### 2. Fetch account data with automatic batching

```tsx
import { useAccount } from "@macalinao/grill";

function TokenBalance({ tokenAccount }: { tokenAccount: string }) {
  const { data: account, isLoading } = useAccount(tokenAccount);
  
  if (isLoading) return <div>Loading...</div>;
  if (!account) return <div>Account not found</div>;
  
  return <div>Balance: {account.lamports}</div>;
}
```

### 3. Send transactions with automatic notifications

```tsx
import { useSendTX } from "@macalinao/grill";
import { getTransferSolInstruction } from "@solana-program/system";

function SendButton() {
  const sendTX = useSendTX();
  
  const handleSend = async () => {
    const instruction = getTransferSolInstruction({
      source: publicKey,
      destination: recipientPublicKey,
      lamports: 1000000000n, // 1 SOL
    });
    
    // Transaction status toasts will automatically appear
    const signature = await sendTX("Transfer SOL", [instruction]);
    console.log("Transaction sent:", signature);
  };
  
  return <button onClick={handleSend}>Send 1 SOL</button>;
}
```

## Provider Options

### GrillProvider

The main provider with built-in toast notifications:

```tsx
<GrillProvider
  maxBatchSize={99}           // Max accounts per batch (default: 99)
  batchDurationMs={10}        // Batch window in ms (default: 10)
  showToasts={true}           // Show transaction toasts (default: true)
  successToastDuration={5000} // Success toast duration (default: 5000)
  errorToastDuration={7000}   // Error toast duration (default: 7000)
  onTransactionStatusEvent={(event) => {
    // Optional: Handle transaction events manually
    console.log("Transaction event:", event);
  }}
>
  {children}
</GrillProvider>
```

### GrillHeadlessProvider

For custom UI implementations without built-in toasts:

```tsx
<GrillHeadlessProvider
  maxBatchSize={99}
  batchDurationMs={10}
  onTransactionStatusEvent={(event) => {
    // Handle all transaction events yourself
    switch (event.type) {
      case "preparing":
        console.log("Preparing transaction...");
        break;
      case "confirmed":
        console.log("Transaction confirmed!");
        break;
      // ... handle other event types
    }
  }}
>
  {children}
</GrillHeadlessProvider>
```

## Hooks

### useAccount

Fetch account data with automatic batching and caching:

```tsx
const { data, isLoading, error, refetch } = useAccount(address, options);
```

### useSendTX

Send transactions with automatic status notifications:

```tsx
const sendTX = useSendTX();

// Send a transaction
const signature = await sendTX(
  "Transaction Name",
  instructions,
  {
    signers: [], // Additional signers
    luts: {},     // Address lookup tables
  }
);
```

### useKitWallet

Access the wallet signer and connection:

```tsx
const { signer, publicKey } = useKitWallet();
```

## Transaction Status Events

The provider emits the following transaction status events:

- `error-wallet-not-connected`: Wallet is not connected
- `preparing`: Building the transaction
- `awaiting-wallet-signature`: Waiting for user approval
- `waiting-for-confirmation`: Transaction sent, awaiting confirmation
- `confirmed`: Transaction confirmed on-chain
- `error-transaction-failed`: Transaction failed

## How Batching Works

When multiple components request account data simultaneously, Grill automatically:

1. Collects all requests within a 10ms window
2. Combines them into a single RPC call (up to 99 accounts)
3. Distributes results to all requesting components
4. Caches results with React Query

This significantly reduces RPC calls and improves performance, especially in data-rich interfaces.

## Requirements

- React 18+ or React 19
- @solana/web3.js v2
- @solana/kit
- @tanstack/react-query v5
- sonner (for toast notifications)

## License

Apache-2.0 © Ian Macalinao

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/macalinao/grill/issues).