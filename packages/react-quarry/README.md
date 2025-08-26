# @macalinao/react-quarry

React hooks for interacting with the Quarry protocol on Solana, built on top of `@macalinao/grill`.

## Installation

```bash
npm install @macalinao/react-quarry @macalinao/grill @macalinao/quarry
# or
yarn add @macalinao/react-quarry @macalinao/grill @macalinao/quarry
# or
bun add @macalinao/react-quarry @macalinao/grill @macalinao/quarry
```

## Features

- **Account Hooks**: Fetch and decode Quarry protocol accounts (Quarry, Miner, Rewarder, etc.)
- **PDA Hooks**: Derive PDA addresses for Quarry protocol accounts
- **Automatic Batching**: Leverages Grill's automatic account batching for efficient RPC usage
- **TypeScript Support**: Fully typed with TypeScript
- **React Query Integration**: Built-in caching and state management

## Usage

### Setup

Ensure your app is wrapped with the necessary providers from `@macalinao/grill`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "gill-react";
import { GrillProvider } from "@macalinao/grill";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <GrillProvider>
          {/* Your app components */}
        </GrillProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
}
```

### Account Hooks

Fetch and decode Quarry protocol accounts:

```tsx
import { useQuarry, useMiner, useRewarder } from "@macalinao/react-quarry";

function QuarryInfo({ quarryAddress }) {
  // Fetch a Quarry account
  const { data: quarry, isLoading } = useQuarry({
    address: quarryAddress,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!quarry) return <div>Quarry not found</div>;

  return (
    <div>
      <h2>Quarry Info</h2>
      <p>Rewards Rate: {quarry.data.annualRewardsRate.toString()}</p>
      <p>Total Deposited: {quarry.data.totalTokensDeposited.toString()}</p>
    </div>
  );
}

function MinerInfo({ minerAddress }) {
  // Fetch a Miner account
  const { data: miner } = useMiner({
    address: minerAddress,
  });

  if (!miner) return null;

  return (
    <div>
      <p>Balance: {miner.data.balance.toString()}</p>
      <p>Rewards Earned: {miner.data.rewardsEarned.toString()}</p>
    </div>
  );
}
```

### PDA Hooks

Derive PDA addresses for Quarry protocol accounts:

```tsx
import { useQuarryPda, useMinerPda } from "@macalinao/react-quarry";

function QuarryPDAExample({ rewarder, tokenMint }) {
  // Derive a Quarry PDA
  const { data: quarryPda } = useQuarryPda({
    rewarder,
    tokenMint,
  });

  return <div>Quarry PDA: {quarryPda?.toString()}</div>;
}

function MinerPDAExample({ quarry, authority }) {
  // Derive a Miner PDA
  const { data: minerPda } = useMinerPda({
    quarry,
    authority,
  });

  return <div>Miner PDA: {minerPda?.toString()}</div>;
}
```

## Available Hooks

### Account Hooks

- `useQuarry` - Fetch and decode a Quarry account
- `useMiner` - Fetch and decode a Miner account
- `useRewarder` - Fetch and decode a Rewarder account
- `useMergeMiner` - Fetch and decode a MergeMiner account
- `useMergePool` - Fetch and decode a MergePool account
- `useMinter` - Fetch and decode a Minter account
- `useMintWrapper` - Fetch and decode a MintWrapper account
- `useOperator` - Fetch and decode an Operator account
- `useRedeemer` - Fetch and decode a Redeemer account
- `useRegistry` - Fetch and decode a Registry account

### PDA Hooks

- `useQuarryPda` - Derive a Quarry PDA
- `useMinerPda` - Derive a Miner PDA
- `useRewarderPda` - Derive a Rewarder PDA
- `useMergeMinerPda` - Derive a MergeMiner PDA
- `useMergePoolPda` - Derive a MergePool PDA
- `useMinterPda` - Derive a Minter PDA
- `useMintWrapperPda` - Derive a MintWrapper PDA
- `useOperatorPda` - Derive an Operator PDA
- `useRedeemerPda` - Derive a Redeemer PDA
- `useRegistryPda` - Derive a Registry PDA
- `useReplicaMintPda` - Derive a Replica Mint PDA

## Advanced Usage

### Combining Hooks

You can combine PDA and account hooks for a complete workflow:

```tsx
import { useQuarryPda, useQuarry } from "@macalinao/react-quarry";

function QuarryDetails({ rewarder, tokenMint }) {
  // First derive the PDA
  const { data: quarryPda } = useQuarryPda({
    rewarder,
    tokenMint,
  });

  // Then fetch the account
  const { data: quarry } = useQuarry({
    address: quarryPda,
  });

  if (!quarry) return <div>Loading...</div>;

  return (
    <div>
      <h3>Quarry at {quarryPda?.toString()}</h3>
      <p>Annual Rewards: {quarry.data.annualRewardsRate.toString()}</p>
    </div>
  );
}
```

### Error Handling

All hooks return React Query results with error handling:

```tsx
function SafeQuarryInfo({ quarryAddress }) {
  const { data: quarry, isLoading, error } = useQuarry({
    address: quarryAddress,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!quarry) return <div>Quarry not found</div>;

  return <div>{/* Render quarry info */}</div>;
}
```

## Benefits of Using Grill

This package leverages `@macalinao/grill` for:

1. **Automatic Batching**: Multiple concurrent account requests are automatically batched into single RPC calls
2. **Caching**: Built-in React Query caching prevents unnecessary refetches
3. **Type Safety**: Full TypeScript support with proper typing
4. **Performance**: Optimized for minimal RPC calls and fast responses

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.