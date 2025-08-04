# @macalinao/kite-query

Account caching and batched loading for React-based Solana applications built for [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2).

## Installation

```bash
bun add @macalinao/kite-query
```

## Features

- ⚡ Efficient account batching with DataLoader
- 🔄 Automatic cache invalidation on transaction success
- 📊 React Query integration for optimal caching
- 🎣 React hooks for easy account data access
- 🔔 Real-time account update subscriptions
- 🛡️ Type-safe account parsing

## Usage

### Basic Setup

```tsx
import { KiteProvider } from "@macalinao/kite-query";
import { createSolanaRpc } from "@solana/kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KiteProvider rpc={rpc}>
        {/* Your app components */}
      </KiteProvider>
    </QueryClientProvider>
  );
}
```

### Using Hooks

```tsx
import { useAccountData, usePubkey } from "@macalinao/kite-query";

function MyComponent() {
  const accountPubkey = usePubkey("11111111111111111111111111111111");
  const { data, loading, error } = useAccountData(accountPubkey);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Account not found</div>;

  return (
    <div>
      <p>Owner: {data.owner}</p>
      <p>Lamports: {data.lamports.toString()}</p>
    </div>
  );
}
```

### Parsing Accounts

```tsx
import { useParsedAccount } from "@macalinao/kite-query";
import { getTokenAccount } from "@solana/spl-token";

function TokenAccountDisplay({ mintAddress }: { mintAddress: string }) {
  const pubkey = usePubkey(mintAddress);
  const { data } = useParsedAccount(pubkey, (data) => {
    // Parse the account data
    return getTokenAccount(data);
  });

  if (!data) return null;

  return <div>Token Balance: {data.accountInfo.data.amount.toString()}</div>;
}
```

### Sending Transactions

```tsx
import { useKite } from "@macalinao/kite-query";
import { address, pipe, createTransferInstruction } from "@solana/kit";

function TransferButton() {
  const { sendTX } = useKite();

  const handleTransfer = async () => {
    const instruction = pipe(
      createTransferInstruction({
        source: address("source..."),
        destination: address("dest..."),
        lamports: 1000000n,
      })
    );

    const result = await sendTX([instruction]);
    console.log("Transaction signature:", result.signature);
  };

  return <button onClick={handleTransfer}>Transfer</button>;
}
```

## API Reference

### Hooks

- `useKite()` - Access the main Kite context
- `useAccountData(address)` - Fetch and subscribe to account data
- `useAccountsData(addresses)` - Fetch multiple accounts
- `usePubkey(string)` - Convert string to Address type
- `useParsedAccount(address, parser)` - Parse account data with custom parser
- `useAccountsSubscribe(addresses, callback)` - Subscribe to account changes

### Providers

- `KiteProvider` - Main provider component
  - `rpc` - Solana RPC client
  - `commitment` - Commitment level (default: "confirmed")
  - `onKiteError` - Error handler callback

## License

Apache-2.0