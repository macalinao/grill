# 05. Advanced Patterns & Best Practices

## The Architecture That Scales

Building a production Solana app isn't just about fetching accounts and sending transactions. It's about patterns that scale with your codebase and team.

## Pattern 1: Domain-Specific Hooks

Don't scatter account fetching logic across your app. Centralize it:

```tsx
// hooks/useTokenBalances.ts
export const useTokenBalances = (owner: Address | null | undefined) => {
  const { data: usdcAccount } = useAssociatedTokenAccount({
    mint: USDC_MINT,
    owner
  });
  
  const { data: usdtAccount } = useAssociatedTokenAccount({
    mint: USDT_MINT,
    owner
  });
  
  const { data: solAccount } = useAccount({
    address: owner
  });
  
  return {
    usdc: usdcAccount ? Number(usdcAccount.data.amount) / 1e6 : 0,
    usdt: usdtAccount ? Number(usdtAccount.data.amount) / 1e6 : 0,
    sol: solAccount ? Number(solAccount.lamports) / 1e9 : 0,
    isLoading: !usdcAccount || !usdtAccount || !solAccount
  };
};

// Now use it everywhere
const Portfolio = () => {
  const { signer } = useKitWallet();
  const balances = useTokenBalances(signer?.address);
  
  return <BalanceDisplay {...balances} />;
};
```

## Pattern 2: Transaction Builders

Separate instruction building from UI logic:

```tsx
// transactions/swap.ts
export class SwapBuilder {
  constructor(
    private signer: TransactionSendingSigner,
    private pool: PoolAccount
  ) {}
  
  async buildSwapInstructions(
    amountIn: bigint,
    minAmountOut: bigint,
    tokenA: boolean
  ): Promise<IInstruction[]> {
    const instructions = [];
    
    // Create ATAs if needed
    instructions.push(
      await this.ensureTokenAccounts()
    );
    
    // Add swap instruction
    instructions.push(
      this.buildSwapInstruction(amountIn, minAmountOut, tokenA)
    );
    
    // Close WSol if swapping to SOL
    if (this.isSwappingToSol()) {
      instructions.push(this.buildCloseWsolInstruction());
    }
    
    return instructions.flat();
  }
  
  private async ensureTokenAccounts() {
    // Implementation
  }
  
  private buildSwapInstruction() {
    // Implementation
  }
}

// Using in component
const SwapWidget = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  const { data: pool } = usePoolAccount(poolAddress);
  
  const handleSwap = async () => {
    const builder = new SwapBuilder(signer, pool);
    const instructions = await builder.buildSwapInstructions(
      amountIn,
      minAmountOut,
      isTokenA
    );
    
    await sendTX(`Swap ${amount} ${token}`, instructions);
  };
};
```

## Pattern 3: Optimistic Updates

Make your UI feel instant:

```tsx
const useOptimisticTransfer = () => {
  const queryClient = useQueryClient();
  const sendTX = useSendTX();
  
  return async (from: Address, to: Address, amount: bigint) => {
    // Optimistically update sender balance
    queryClient.setQueryData(
      createAccountQueryKey(from),
      (old: Account) => ({
        ...old,
        lamports: old.lamports - amount
      })
    );
    
    // Optimistically update receiver balance
    queryClient.setQueryData(
      createAccountQueryKey(to),
      (old: Account) => ({
        ...old,
        lamports: (old?.lamports || 0n) + amount
      })
    );
    
    try {
      // Send actual transaction
      const instructions = getTransferSolInstruction({
        source: from,
        destination: to,
        amount
      });
      
      await sendTX(`Transfer ${amount / 1e9} SOL`, [instructions]);
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries({
        queryKey: createAccountQueryKey(from)
      });
      queryClient.invalidateQueries({
        queryKey: createAccountQueryKey(to)
      });
      throw error;
    }
  };
};
```

## Pattern 4: Subscription Management

Combine polling with subscriptions for real-time updates:

```tsx
const useRealtimeAccount = (address: Address) => {
  const { data, refetch } = useAccount({
    address,
    options: {
      refetchInterval: 30_000 // Poll every 30 seconds as backup
    }
  });
  
  useEffect(() => {
    if (!address) return;
    
    // Set up WebSocket subscription
    const subscription = rpcSubscriptions
      .accountNotifications(address, { commitment: "confirmed" })
      .subscribe({
        next: () => refetch(),
        error: console.error
      });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [address, refetch]);
  
  return data;
};
```

## Pattern 5: Error Boundaries

Gracefully handle RPC failures:

```tsx
const AccountErrorBoundary: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="error-container">
          <h3>Failed to load account data</h3>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>Retry</button>
        </div>
      )}
      onReset={() => {
        // Clear query cache on reset
        queryClient.invalidateQueries();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Wrap account-dependent components
<AccountErrorBoundary>
  <TokenBalances />
</AccountErrorBoundary>
```

## Pattern 6: Multi-Cluster Support

Build apps that work across mainnet, devnet, and localnet:

```tsx
const ClusterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [cluster, setCluster] = useState<Cluster>("mainnet-beta");
  
  const client = useMemo(() => 
    createSolanaClient({
      urlOrMoniker: cluster
    }),
    [cluster]
  );
  
  return (
    <ClusterContext.Provider value={{ cluster, setCluster }}>
      <SolanaProvider client={client}>
        <GrillProvider>
          {children}
        </GrillProvider>
      </SolanaProvider>
    </ClusterContext.Provider>
  );
};
```

## Pattern 7: Lazy Account Resolution

Don't fetch what you don't need:

```tsx
const LazyTokenList = ({ mints }: { mints: Address[] }) => {
  const [expanded, setExpanded] = useState<Set<Address>>(new Set());
  
  return mints.map(mint => (
    <LazyToken
      key={mint}
      mint={mint}
      isExpanded={expanded.has(mint)}
      onToggle={() => {
        setExpanded(prev => {
          const next = new Set(prev);
          if (next.has(mint)) {
            next.delete(mint);
          } else {
            next.add(mint);
          }
          return next;
        });
      }}
    />
  ));
};

const LazyToken = ({ mint, isExpanded, onToggle }) => {
  // Only fetch when expanded
  const { data: mintAccount } = useAccount({
    address: isExpanded ? mint : null,
    decoder: getMintDecoder()
  });
  
  return (
    <div>
      <button onClick={onToggle}>
        {mint.slice(0, 8)}...
      </button>
      {isExpanded && mintAccount && (
        <div>
          Supply: {mintAccount.data.supply.toString()}
          Decimals: {mintAccount.data.decimals}
        </div>
      )}
    </div>
  );
};
```

## Pattern 8: Batch Transaction Status

Track multiple transactions as a unit:

```tsx
const useBatchTransactions = () => {
  const sendTX = useSendTX();
  const [batch, setBatch] = useState<{
    id: string;
    status: "pending" | "confirmed" | "failed";
    signature?: string;
  }[]>([]);
  
  const sendBatch = async (
    transactions: Array<{
      name: string;
      instructions: IInstruction[];
    }>
  ) => {
    const batchId = crypto.randomUUID();
    
    // Initialize batch status
    setBatch(transactions.map((tx, i) => ({
      id: `${batchId}-${i}`,
      status: "pending"
    })));
    
    // Send transactions sequentially
    for (let i = 0; i < transactions.length; i++) {
      try {
        const sig = await sendTX(
          transactions[i].name,
          transactions[i].instructions
        );
        
        setBatch(prev => prev.map((item, idx) => 
          idx === i 
            ? { ...item, status: "confirmed", signature: sig }
            : item
        ));
      } catch (error) {
        setBatch(prev => prev.map((item, idx) => 
          idx === i 
            ? { ...item, status: "failed" }
            : item
        ));
        throw error; // Stop batch on failure
      }
    }
  };
  
  return { sendBatch, batch };
};
```

## Pattern 9: Account Prefetching

Prefetch accounts before users need them:

```tsx
const usePrefetchOnHover = () => {
  const queryClient = useQueryClient();
  
  const prefetchAccount = (address: Address) => {
    queryClient.prefetchQuery({
      queryKey: createAccountQueryKey(address),
      queryFn: () => accountLoader.load(address),
      staleTime: 60_000 // Consider fresh for 1 minute
    });
  };
  
  return { prefetchAccount };
};

const TokenCard = ({ mint }) => {
  const { prefetchAccount } = usePrefetchOnHover();
  
  return (
    <div
      onMouseEnter={() => prefetchAccount(mint)}
      onClick={() => navigate(`/token/${mint}`)}
    >
      {/* Token preview */}
    </div>
  );
};
```

## Pattern 10: Custom Program Integration

Integrate your own programs seamlessly:

```tsx
// Create typed hooks for your program
const useMyProgram = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  
  const initialize = async (params: InitializeParams) => {
    const [statePDA] = await findProgramAddress(
      [Buffer.from("state"), signer.address.toBuffer()],
      MY_PROGRAM_ID
    );
    
    const instruction = myProgramClient.createInitializeInstruction(
      params,
      statePDA
    );
    
    await sendTX("Initialize program", [instruction]);
    return statePDA;
  };
  
  const execute = async (params: ExecuteParams) => {
    const instruction = myProgramClient.createExecuteInstruction(params);
    await sendTX("Execute action", [instruction]);
  };
  
  return { initialize, execute };
};
```

## Performance Best Practices

### 1. Batch Window Optimization

```tsx
// For high-frequency trading apps, reduce batch window
<GrillProvider batchDurationMs={5}>

// For normal apps, default is good
<GrillProvider batchDurationMs={10}>

// For read-heavy dashboards, increase it
<GrillProvider batchDurationMs={20}>
```

### 2. Cache Strategy

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Accounts are stale after 30 seconds
      staleTime: 30_000,
      
      // Keep in cache for 5 minutes
      gcTime: 5 * 60_000,
      
      // Retry failed queries
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
    },
  },
});
```

### 3. Selective Refetching

```tsx
// Only refetch accounts that were modified
const sendTXWithSelectiveRefetch = async (
  title: string,
  instructions: IInstruction[]
) => {
  // Identify accounts that will be modified
  const modifiedAccounts = instructions.flatMap(ix => 
    ix.accounts
      .filter(acc => acc.isWritable)
      .map(acc => acc.address)
  );
  
  // Send transaction
  const sig = await sendTX(title, instructions);
  
  // Only refetch modified accounts
  await Promise.all(
    modifiedAccounts.map(address =>
      queryClient.invalidateQueries({
        queryKey: createAccountQueryKey(address)
      })
    )
  );
  
  return sig;
};
```

## Security Best Practices

### 1. Never Trust Client Data

```tsx
// Bad - trusting client-provided amount
const handleTransfer = async (amount: string) => {
  const lamports = BigInt(amount);
  await sendTX("Transfer", transferInstructions(lamports));
};

// Good - validate everything
const handleTransfer = async (amount: string) => {
  // Validate input
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0 || parsed > MAX_TRANSFER) {
    throw new Error("Invalid amount");
  }
  
  // Check balance
  const { data: account } = useAccount({ address: signer.address });
  if (!account || account.lamports < parsed * 1e9) {
    throw new Error("Insufficient balance");
  }
  
  const lamports = BigInt(Math.floor(parsed * 1e9));
  await sendTX("Transfer", transferInstructions(lamports));
};
```

### 2. Simulate Before Sending

```tsx
const useSimulatedTransaction = () => {
  const { rpc } = useSolanaClient();
  const sendTX = useSendTX();
  
  return async (title: string, instructions: IInstruction[]) => {
    // Build transaction
    const message = createTransactionMessage({ 
      version: 0,
      instructions 
    });
    
    // Simulate first
    const simulation = await rpc.simulateTransaction(message);
    
    if (simulation.value.err) {
      console.error("Simulation failed:", simulation.value.err);
      throw new Error("Transaction would fail");
    }
    
    // If simulation passes, send it
    return sendTX(title, instructions);
  };
};
```

## The Philosophy Redux

Grill isn't just a library—it's a philosophy about how Solana apps should be built:

1. **Batching by default** - Performance isn't optional
2. **Type safety everywhere** - Runtime errors are bugs
3. **Composition over configuration** - Small, focused hooks that combine
4. **Progressive enhancement** - Start simple, add complexity as needed
5. **Developer experience matters** - If it's not pleasant to use, it's not done

## Conclusion

You now have everything you need to build production Solana applications with Grill. The patterns in this guide aren't just suggestions—they're battle-tested approaches from real applications.

Remember: Grill handles the complexity so you can focus on building. Stop fighting with RPC calls and account management. Start building the future of Solana.

Happy grilling! 🔥