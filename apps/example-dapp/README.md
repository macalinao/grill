# Mast Example DApp

This example demonstrates how to use the Mast library with DataLoader integration for efficient Solana blockchain interactions.

## Features

- **SolanaClientProvider**: Uses gill's `createSolanaClient` for RPC connections
- **MastProvider**: Provides a DataLoader for batched account fetching
- **Wallet Integration**: Supports Phantom, Solflare, and Backpack wallets
- **UI Components**: Built with Tailwind CSS v4 and shadcn components
- **React Query**: Integrated for data fetching and caching

## Running the Example

```bash
# From the monorepo root
bun install
bun run build

# Run the example app
cd apps/example-dapp
bun run dev
```

## Key Components

### App.tsx
Sets up the provider hierarchy:
1. QueryClientProvider (React Query)
2. SolanaClientProvider (RPC connection via gill)
3. ConnectionProvider (Wallet adapter compatibility)
4. WalletProvider (Wallet connections)
5. MastProvider (DataLoader for accounts)

### SimpleDashboard.tsx
Demonstrates:
- Wallet connection with WalletMultiButton
- Fetching account balance using the DataLoader
- Making RPC calls to get the current slot
- Toast notifications for user feedback

## Usage Example

```typescript
// Access the Solana client
const { rpc } = useSolanaClient()

// Access the account loader
const { accountLoader } = useMast()

// Fetch account info (batched automatically)
const accountInfo = await accountLoader.load(address(publicKey.toBase58()))

// Make RPC calls
const slot = await rpc.getSlot().send()
```