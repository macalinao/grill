# grill

A React provider for Solana account management with automatic batching and caching, built on top of gill-react.

## Installation

```bash
npm install @macalinao/grill
```

## Usage

### 1. Wrap your app with GrillProvider

```tsx
import { SolanaProvider } from 'gill-react';
import { GrillProvider } from '@macalinao/grill';
import { createSolanaClient } from 'gill';

const client = createSolanaClient({ urlOrMoniker: 'devnet' });

function App() {
  return (
    <SolanaProvider client={client}>
      <GrillProvider>
        {/* Your app components */}
      </GrillProvider>
    </SolanaProvider>
  );
}
```

### 2. Use the useAccount hook

```tsx
import { useAccount } from '@macalinao/grill';

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

- **Automatic Batching**: Multiple concurrent account requests are automatically batched into a single RPC call
- **React Query Integration**: Built-in caching, refetching, and state management
- **TypeScript Support**: Fully typed with TypeScript
- **Configurable**: Customize batch size and timing

## API

### GrillProvider

Provider component that sets up the account batching context.

Props:
- `children`: React node(s)
- `maxBatchSize?: number` - Maximum number of accounts to fetch in a single batch (default: 99)
- `batchDurationMs?: number` - Time to wait before sending a batch in milliseconds (default: 10)

### useAccount

Hook to fetch account information with automatic batching.

Parameters:
- `address: string` - The account address to fetch

Returns:
- React Query result object with:
  - `data: AccountInfo | null | undefined` - The account data
  - `isLoading: boolean` - Loading state
  - `error: Error | null` - Error state
  - Plus all other React Query return values

## License

Apache-2.0