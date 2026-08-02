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
import { SolanaProvider } from "@gillsdk/react";
import { GrillProvider } from "@macalinao/grill";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <GrillProvider>{/* Your app components */}</GrillProvider>
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
  maxBatchSize={99} // Max accounts per batch (default: 99)
  batchDurationMs={10} // Batch window in ms (default: 10)
  showToasts={true} // Show transaction toasts (default: true)
  successToastDuration={5000} // Success toast duration (default: 5000)
  errorToastDuration={7000} // Error toast duration (default: 7000)
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
const signature = await sendTX("Transaction Name", instructions, {
  signers: [], // Additional signers
  luts: {}, // Address lookup tables
});
```

### useKitWallet

Access the wallet signer and connection:

```tsx
const { signer, publicKey } = useKitWallet();
```

### useRefetchAccount / useRefetchAccounts

Convenience hooks to force-refresh accounts (e.g. balances) from inside a
component:

```tsx
const refetchAccount = useRefetchAccount();
await refetchAccount(tokenAccountAddress);
```

You don't have to use a hook — see [Refreshing Account Data](#refreshing-account-data)
for the query-key approach, which works anywhere you have a `QueryClient`.

## Refreshing Account Data

**React Query is the single source of truth for account data.** Grill's
DataLoader only coalesces concurrent requests inside its batch window (so N
components asking for N accounts still make one RPC call) — it retains nothing
afterwards. That means standard React Query invalidation just works.

The canonical way to force a refresh is the query key. `createAccountQueryKey`
is a plain function, not a hook, so you can use it anywhere you have a
`QueryClient` — a mutation callback, an event handler, a plain service module —
with no React context involved:

```ts
import { createAccountQueryKey } from "@macalinao/grill";

// Refresh one account (e.g. a token balance) after a transaction
await queryClient.invalidateQueries({
  queryKey: createAccountQueryKey(address),
  exact: true,
});
```

Because the namespace is shared, you can also invalidate broadly:

```ts
import { GRILL_REACT_QUERY_NAMESPACE } from "@macalinao/grill";

// Refresh every account grill knows about
await queryClient.invalidateQueries({
  queryKey: [GRILL_REACT_QUERY_NAMESPACE, "account"],
});
```

Everything else follows from React Query too: `refetch()` from `useAccount`,
`staleTime`, `refetchOnWindowFocus`, and `refetchOnMount` all behave normally
and will actually hit the RPC.

> 💡 Since accounts are no longer memoized forever, `staleTime` (React Query's
> default is `0`) now governs how often they refetch. Set a `staleTime` on your
> `QueryClient` if you want to trade freshness for fewer RPC calls.

### Optional hooks

If you're already inside a component, `useRefetchAccount` / `useRefetchAccounts`
are thin sugar over the same thing (they also clear the DataLoader, which
matters only if you opted into `cache: true`):

```tsx
const refetchAccount = useRefetchAccount();
await refetchAccount(tokenAccountAddress);

const refetchAccounts = useRefetchAccounts();
await refetchAccounts([addressA, addressB]); // batched into one RPC call
```

Both only refresh the addresses you pass — they don't refresh the whole cache.

Note that transactions sent via `useSendTX` **already refetch every writable
account** automatically once confirmed, so you often don't need to refresh
manually at all.

To refresh a **token balance** (`useTokenBalance`), target the **token account
address** — the balance is derived from that account plus its mint's token info.

## Handling Decode Errors

`useAccount`/`useAccounts` decode failures surface as the query's `error` (an
`AccountDecodeError` carrying the offending `address` and `programAddress`), so
one malformed account never crashes the tree:

```tsx
import { AccountDecodeError } from "@macalinao/grill";

const { data, error } = useAccount({ address, decoder });
if (error instanceof AccountDecodeError) {
  console.warn(`Could not decode ${error.address} (owner ${error.programAddress})`);
}
```

For live subscriptions (`subscribeToUpdates: true`), a notification that fails
to decode is logged and skipped — the last successfully decoded value stays in
the cache and the subscription keeps running.

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/macalinao/grill/issues).

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
