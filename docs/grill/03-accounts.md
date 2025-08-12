# 03. Reading & Parsing Accounts

## The Magic of Automatic Batching

Here's what happens when your app renders with Grill:

```tsx
const Dashboard: React.FC = () => {
  return (
    <>
      <UserBalance />        {/* Requests user account */}
      <TokenBalances />      {/* Requests 5 token accounts */}
      <StakingPositions />   {/* Requests 3 staking accounts */}
      <LPPositions />        {/* Requests 4 LP accounts */}
    </>
  );
};
```

Without Grill: **13 separate RPC calls**
With Grill: **1 batched RPC call** (assuming they render in the same tick)

This isn't configuration you have to set up. It just works.

## Basic Account Fetching

The `useAccount` hook is your workhorse:

```tsx
import { useAccount } from "@macalinao/grill";

interface AccountInfoProps {
  address: Address;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ address }) => {
  const { data: account, isLoading, error } = useAccount({
    address
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!account) return <div>Account not found</div>;
  
  return (
    <div>
      <p>Lamports: {account.lamports.toString()}</p>
      <p>Owner: {account.programAddress}</p>
      <p>Executable: {account.executable ? "Yes" : "No"}</p>
    </div>
  );
};
```

## Type-Safe Account Decoding

Raw account data is just bytes. Grill makes decoding type-safe and automatic:

```tsx
import { useAccount } from "@macalinao/grill";
import { getTokenAccountDecoder } from "@solana-program/token";

interface TokenAccountInfoProps {
  address: Address;
}

const TokenAccountInfo: React.FC<TokenAccountInfoProps> = ({ address }) => {
  const { data: account } = useAccount({
    address,
    decoder: getTokenAccountDecoder()
  });
  
  if (!account) return null;
  
  // account.data is now fully typed as TokenAccount
  return (
    <div>
      <p>Mint: {account.data.mint}</p>
      <p>Owner: {account.data.owner}</p>
      <p>Amount: {account.data.amount.toString()}</p>
      <p>Decimals: {account.data.decimals}</p>
    </div>
  );
};
```

The decoder ensures your data is properly typed. No more manual deserialization, no more type assertions.

## Associated Token Accounts

The most common pattern in Solana: fetching a user's token balance. Grill makes it one line:

```tsx
import { useAssociatedTokenAccount } from "@macalinao/grill";

interface USDCBalanceProps {
  userAddress: Address;
}

const USDCBalance: React.FC<USDCBalanceProps> = ({ userAddress }) => {
  const { data: tokenAccount } = useAssociatedTokenAccount({
    mint: USDC_MINT,
    owner: userAddress
  });
  
  // No PDA derivation needed
  // No manual account fetching
  // Automatically decoded as TokenAccount
  
  const balance = tokenAccount 
    ? (Number(tokenAccount.data.amount) / 1e6).toFixed(2)
    : "0.00";
    
  return <div>${balance} USDC</div>;
};
```

Compare this to the traditional approach:

```tsx
// The old way - so much boilerplate!
const USDCBalance: React.FC<USDCBalanceProps> = ({ userAddress }) => {
  const { connection } = useConnection();
  const [balance, setBalance] = useState("0.00");
  
  useEffect(() => {
    const fetchBalance = async () => {
      // Manually derive the ATA address
      const ata = await getAssociatedTokenAddress(
        USDC_MINT,
        userAddress,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Fetch the account
      const accountInfo = await connection.getAccountInfo(ata);
      
      if (accountInfo) {
        // Manually decode the data
        const decoded = TokenAccountLayout.decode(accountInfo.data);
        const amount = Number(decoded.amount) / 1e6;
        setBalance(amount.toFixed(2));
      }
    };
    
    fetchBalance();
  }, [userAddress, connection]);
  
  return <div>${balance} USDC</div>;
};
```

The Grill version is 80% less code and automatically batched with other requests.

## Multiple Token Accounts

Need to show all of a user's token balances? Use batching to your advantage:

```tsx
interface TokenPortfolioProps {
  userAddress: Address;
  mints: Address[];
}

const TokenPortfolio: React.FC<TokenPortfolioProps> = ({ userAddress, mints }) => {
  // All of these will be batched into minimal RPC calls
  const tokenAccounts = mints.map(mint => ({
    mint,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    account: useAssociatedTokenAccount({
      mint,
      owner: userAddress
    })
  }));
  
  return (
    <div>
      {tokenAccounts.map(({ mint, account }) => (
        <TokenBalance 
          key={mint} 
          mint={mint} 
          account={account.data} 
        />
      ))}
    </div>
  );
};
```

## Creating Custom Account Hooks

Grill provides primitives to build your own specialized hooks:

```tsx
import { createDecodedAccountHook } from "@macalinao/grill";

// Create a hook for your program's accounts
const useMyProgramAccount = createDecodedAccountHook({
  decoder: getMyProgramAccountDecoder()
});

// Now use it anywhere
const MyComponent: React.FC = () => {
  const { data: account } = useMyProgramAccount({
    address: someAddress
  });
  
  // account.data is fully typed as MyProgramAccount
};
```

## PDA Hooks

Working with Program Derived Addresses? Create reusable hooks:

```tsx
import { createPdaHook } from "@macalinao/grill";
import { findProgramDerivedAddress } from "@solana/kit";

// Define your PDA derivation function
const findUserStatsPda = async (user: Address) => {
  return findProgramDerivedAddress({
    programAddress: STATS_PROGRAM_ID,
    seeds: [
      new TextEncoder().encode("user-stats"),
      user.toBytes()
    ]
  });
};

// Create a reusable hook
const useUserStatsPDA = createPdaHook(
  findUserStatsPda,
  "userStatsPda"
);

// Use it in components
interface UserStatsProps {
  userAddress: Address;
}

const UserStats: React.FC<UserStatsProps> = ({ userAddress }) => {
  const pda = useUserStatsPDA(userAddress);
  const { data: stats } = useAccount({
    address: pda,
    decoder: getUserStatsDecoder()
  });
  
  return <div>Wins: {stats?.data.wins || 0}</div>;
};
```

## Conditional Fetching

Only fetch when you need to:

```tsx
interface ConditionalAccountProps {
  shouldFetch: boolean;
  address: Address | null;
}

const ConditionalAccount: React.FC<ConditionalAccountProps> = ({ shouldFetch, address }) => {
  const { data: account } = useAccount({
    address: shouldFetch ? address : null
  });
  
  // Account is only fetched if shouldFetch is true
  // This prevents unnecessary RPC calls
};
```

## Refetching and Cache Invalidation

Grill integrates with React Query, giving you powerful cache controls:

```tsx
interface RefreshableBalanceProps {
  address: Address;
}

const RefreshableBalance: React.FC<RefreshableBalanceProps> = ({ address }) => {
  const { 
    data: account, 
    refetch,
    isRefetching 
  } = useAccount({
    address,
    options: {
      // React Query options
      staleTime: 30_000,  // Consider data stale after 30 seconds
      gcTime: 5 * 60_000,  // Keep in cache for 5 minutes
    }
  });
  
  return (
    <div>
      <p>Balance: {account?.lamports.toString()}</p>
      <button onClick={() => refetch()} disabled={isRefetching}>
        {isRefetching ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
};
```

## Advanced: Manual Cache Updates

After a transaction, you might want to optimistically update the cache:

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { createAccountQueryKey } from "@macalinao/grill";

interface TransferButtonProps {
  from: Address;
  to: Address;
  amount: bigint;
}

const TransferButton: React.FC<TransferButtonProps> = ({ from, to, amount }) => {
  const queryClient = useQueryClient();
  const sendTX = useSendTX();
  
  const handleTransfer = async (): Promise<void> => {
    // Send transaction
    await sendTX("Transfer SOL", transferInstructions);
    
    // Optimistically update cache
    queryClient.setQueryData(
      createAccountQueryKey(from),
      (old) => ({
        ...old,
        lamports: old.lamports - amount
      })
    );
    
    queryClient.setQueryData(
      createAccountQueryKey(to),
      (old) => ({
        ...old,
        lamports: old.lamports + amount
      })
    );
    
    // Refetch to get real data
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: createAccountQueryKey(from)
      });
      queryClient.invalidateQueries({
        queryKey: createAccountQueryKey(to)
      });
    }, 2000);
  };
};
```

## Performance Patterns

### Pattern 1: Prefetch Critical Data

```tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { signer } = useKitWallet();
  
  // Prefetch user's main account and common token accounts
  useAccount({ address: signer?.address });
  useAssociatedTokenAccount({ 
    mint: USDC_MINT, 
    owner: signer?.address 
  });
  useAssociatedTokenAccount({ 
    mint: USDT_MINT, 
    owner: signer?.address 
  });
  
  // These will be cached when child components request them
  return <div>{children}</div>;
};
```

### Pattern 2: Batch Related Accounts

```tsx
interface LiquidityPoolProps {
  poolAddress: Address;
}

const LiquidityPool: React.FC<LiquidityPoolProps> = ({ poolAddress }) => {
  const { data: pool } = useAccount({
    address: poolAddress,
    decoder: getPoolDecoder()
  });
  
  // Fetch all related accounts at once - they'll be batched
  const { data: tokenAVault } = useAccount({
    address: pool?.data.tokenAVault
  });
  
  const { data: tokenBVault } = useAccount({
    address: pool?.data.tokenBVault
  });
  
  const { data: lpMint } = useAccount({
    address: pool?.data.lpMint
  });
  
  // All fetched in one RPC call!
};
```

### Pattern 3: Lazy Load Non-Critical Data

```tsx
interface TokenDetailsProps {
  mint: Address;
}

const TokenDetails: React.FC<TokenDetailsProps> = ({ mint }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Only fetch when expanded
  const { data: mintAccount } = useAccount({
    address: showDetails ? mint : null,
    decoder: getMintDecoder()
  });
  
  return (
    <div>
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? "Hide" : "Show"} Details
      </button>
      {showDetails && mintAccount && (
        <div>
          Supply: {mintAccount.data.supply.toString()}
          Decimals: {mintAccount.data.decimals}
        </div>
      )}
    </div>
  );
};
```

## The Mental Model

Think of Grill's account fetching like a efficient postal service:

1. **Components are like houses** - Each requests mail (account data)
2. **Grill is the postal service** - Collects all requests in the neighborhood
3. **Batching is the delivery truck** - One trip to fetch everyone's mail
4. **React Query is the mailbox** - Stores the mail so you don't need to request it again

This mental model helps you understand why Grill is so efficient. Instead of each component making its own trip to the post office (RPC node), Grill collects all the requests and makes one efficient trip.

## Next Steps

Now that you're fetching accounts efficiently, let's look at [making transactions](./04-transactions.md).