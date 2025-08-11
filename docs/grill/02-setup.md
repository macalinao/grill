# 02. Setup & Migration

## Installation

```bash
# Core packages
npm install @macalinao/grill gill

# Required peer dependencies
npm install @tanstack/react-query sonner

# If you're using wallet-adapter
npm install @macalinao/wallet-adapter-compat
```

That's it. Grill is designed to work alongside your existing Solana dependencies.

## The Provider Stack

Grill requires a specific provider hierarchy. This isn't arbitrary—each provider depends on the context from the ones above it:

```tsx
import { GrillProvider } from "@macalinao/grill";
import { WalletAdapterCompatProvider } from "@macalinao/wallet-adapter-compat";
import {
  ConnectionProvider,
  WalletProvider as WalletAdapterProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "gill-react";
import { createSolanaClient } from "gill";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({
  urlOrMoniker: "mainnet-beta", // or your RPC URL
});

export const App = () => {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider client={solanaClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletAdapterProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <WalletAdapterCompatProvider>
                <GrillProvider>
                  {/* Your app */}
                  <YourApp />
                  <Toaster position="bottom-right" />
                </GrillProvider>
              </WalletAdapterCompatProvider>
            </WalletModalProvider>
          </WalletAdapterProvider>
        </ConnectionProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
};
```

### Why This Order Matters

1. **QueryClientProvider**: Provides React Query context for caching
2. **SolanaProvider**: Provides the gill client for RPC operations
3. **ConnectionProvider**: Legacy support for wallet-adapter
4. **WalletAdapterProvider**: Manages wallet connections
5. **WalletModalProvider**: UI for wallet selection
6. **WalletAdapterCompatProvider**: Bridges wallet-adapter to @solana/kit
7. **GrillProvider**: Creates the DataLoader and provides Grill context

Each layer builds on the previous. GrillProvider needs access to the wallet (for transactions) and the RPC client (for fetching), which is why it comes last.

## Incremental Migration from @solana/wallet-adapter

The beauty of Grill is that you don't need to rewrite your entire app. You can migrate component by component.

### Step 1: Add Grill to Your Existing App

If you already have a wallet-adapter setup, just wrap it with the additional providers:

```tsx
// Your existing setup
<ConnectionProvider endpoint={endpoint}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      {/* Your existing app */}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>

// Add Grill incrementally
<QueryClientProvider client={queryClient}>
  <SolanaProvider client={solanaClient}>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletAdapterCompatProvider>
            <GrillProvider>
              {/* Your existing app - unchanged! */}
            </GrillProvider>
          </WalletAdapterCompatProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </SolanaProvider>
</QueryClientProvider>
```

Your existing code continues to work. Now you can start using Grill hooks in new components or when refactoring old ones.

### Step 2: Migrate Account Fetching

Start with read operations—they're the easiest and give immediate performance benefits:

```tsx
// Old way with wallet-adapter
const MyComponent = () => {
  const { connection } = useConnection();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connection
      .getAccountInfo(someAddress)
      .then(setAccount)
      .finally(() => setLoading(false));
  }, [connection]);

  if (loading) return <div>Loading...</div>;
  // ... use account
};

// New way with Grill
const MyComponent = () => {
  const { data: account, isLoading } = useAccount({
    address: someAddress,
  });

  if (isLoading) return <div>Loading...</div>;
  // ... use account
};
```

The Grill version is cleaner, automatically batched, and cached. But here's the key: **both components can coexist in your app**.

### Step 3: Migrate Token Accounts

Token accounts are where Grill really shines:

```tsx
// Old way - manual PDA derivation + fetch
const TokenBalance = ({ mint, owner }) => {
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const ata = await getAssociatedTokenAddress(mint, owner);
      const account = await connection.getAccountInfo(ata);
      if (account) {
        const decoded = deserializeAccount(account.data);
        setBalance(decoded.amount.toString());
      }
    };
    fetchBalance();
  }, [mint, owner, connection]);

  return <div>{balance || "0"}</div>;
};

// New way with Grill
const TokenBalance = ({ mint, owner }) => {
  const { data: tokenAccount } = useAssociatedTokenAccount({
    mint,
    owner,
  });

  return <div>{tokenAccount?.data.amount.toString() || "0"}</div>;
};
```

Notice: No manual PDA derivation. No deserialization boilerplate. And if multiple components request the same token account? It's only fetched once.

### Step 4: Migrate Transactions

Transactions benefit from Grill's automatic status management:

```tsx
// Old way
const SwapButton = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    try {
      setLoading(true);
      const tx = new Transaction().add(...instructions);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);
      toast.success("Swap successful!");
    } catch (error) {
      toast.error("Swap failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSwap} disabled={loading}>
      Swap
    </button>
  );
};

// New way with Grill
const SwapButton = () => {
  const sendTX = useSendTX();

  const handleSwap = async () => {
    await sendTX("Swap tokens", instructions);
    // That's it. Status toasts are automatic.
  };

  return <button onClick={handleSwap}>Swap</button>;
};
```

## Configuration Options

### GrillProvider Options

```tsx
<GrillProvider
  // Batching configuration
  maxBatchSize={99} // Max accounts per RPC call (default: 99)
  batchDurationMs={10} // Time window for batching (default: 10ms)
  // Toast configuration
  showToasts={true} // Enable toast notifications (default: true)
  successToastDuration={5000} // Success toast duration (default: 5000ms)
  errorToastDuration={7000} // Error toast duration (default: 7000ms)
  // Custom transaction status handler
  onTransactionStatusEvent={(event) => {
    console.log("Transaction status:", event);
    // Custom handling if needed
  }}
>
  {children}
</GrillProvider>
```

### Headless Mode

If you want to handle transaction notifications yourself:

```tsx
import { GrillHeadlessProvider } from "@macalinao/grill";

<GrillHeadlessProvider
  maxBatchSize={99}
  batchDurationMs={10}
  onTransactionStatusEvent={(event) => {
    // Your custom notification logic
    switch (event.type) {
      case "preparing":
        showCustomLoader("Building transaction...");
        break;
      case "confirmed":
        showCustomSuccess(`Transaction confirmed: ${event.sig}`);
        break;
      // ... handle other statuses
    }
  }}
>
  {children}
</GrillHeadlessProvider>;
```

## Working with Multiple Clusters

```tsx
const DevnetApp = () => {
  const devnetClient = createSolanaClient({
    urlOrMoniker: "devnet",
  });

  return (
    <SolanaProvider client={devnetClient}>
      <GrillProvider>{/* Your devnet app */}</GrillProvider>
    </SolanaProvider>
  );
};

const MainnetApp = () => {
  const mainnetClient = createSolanaClient({
    urlOrMoniker: "https://your-rpc-provider.com",
  });

  return (
    <SolanaProvider client={mainnetClient}>
      <GrillProvider>{/* Your mainnet app */}</GrillProvider>
    </SolanaProvider>
  );
};
```

## TypeScript Configuration

Grill is built with TypeScript first. For the best experience:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022"
  }
}
```

## Common Migration Patterns

### Pattern 1: Gradual Component Migration

Start with leaf components (those without children depending on wallet-adapter):

1. Token balance displays
2. Account info cards
3. Transaction history lists

Then move to interactive components:

1. Swap buttons
2. Stake/unstake forms
3. Governance voting

Finally, migrate core app logic:

1. Wallet connection
2. Route guards
3. Global state

### Pattern 2: Feature Flag Migration

Use feature flags to test Grill in production:

```tsx
const AccountDisplay = ({ address }) => {
  if (featureFlags.useGrill) {
    return <GrillAccountDisplay address={address} />;
  }
  return <LegacyAccountDisplay address={address} />;
};
```

### Pattern 3: Side-by-Side Comparison

During migration, you can fetch the same data both ways to ensure consistency:

```tsx
const DebugComponent = ({ address }) => {
  // Old way
  const { connection } = useConnection();
  const [legacyAccount, setLegacyAccount] = useState(null);

  useEffect(() => {
    connection.getAccountInfo(address).then(setLegacyAccount);
  }, [address, connection]);

  // New way
  const { data: grillAccount } = useAccount({ address });

  // Compare in development
  if (process.env.NODE_ENV === "development") {
    console.log("Legacy:", legacyAccount);
    console.log("Grill:", grillAccount);
  }

  return <div>{/* Your UI */}</div>;
};
```

## Next Steps

Now that Grill is set up, let's dive into the most powerful feature: [reading and parsing accounts](./03-accounts.md).
