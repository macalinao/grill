# 04. Making Transactions

## The Transaction Lifecycle

Every Solana transaction goes through stages:
1. **Building** - Constructing instructions
2. **Signing** - Getting wallet approval
3. **Sending** - Broadcasting to the network
4. **Confirming** - Waiting for consensus

Most libraries make you manage each stage yourself. Grill handles it all with one hook.

## The useSendTX Hook

This is where Grill shines. One function, automatic status management:

```tsx
import { useSendTX } from "@macalinao/grill";

const SwapButton = () => {
  const sendTX = useSendTX();
  
  const handleSwap = async () => {
    const instructions = buildSwapInstructions();
    const signature = await sendTX("Swap USDC for SOL", instructions);
    console.log("Transaction confirmed:", signature);
  };
  
  return <button onClick={handleSwap}>Swap</button>;
};
```

That's it. When you click the button:
1. ✅ Toast notification: "Building transaction"
2. ✅ Toast notification: "Please approve in your wallet"
3. ✅ Toast notification: "Transaction: 3xKL9..." with explorer link
4. ✅ Toast notification: "Swap USDC for SOL confirmed"

No loading states to manage. No error handling boilerplate. It just works.

## Building Instructions

Grill works with standard Solana instructions. Use gill's modern instruction builders:

```tsx
import { getTransferSolInstruction } from "@solana-program/system";
import { 
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferTokensInstruction 
} from "@solana-program/token";

const TransferPanel = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  
  const handleTransferSOL = async (to: Address, amount: bigint) => {
    const instruction = getTransferSolInstruction({
      source: signer,
      destination: to,
      amount
    });
    
    await sendTX(`Send ${amount / 1e9} SOL`, [instruction]);
  };
  
  const handleTransferTokens = async (
    mint: Address,
    to: Address,
    amount: bigint
  ) => {
    const instructions = [];
    
    // Create ATA if needed (idempotent)
    instructions.push(
      getCreateAssociatedTokenIdempotentInstruction({
        payer: signer,
        owner: to,
        mint
      })
    );
    
    // Transfer tokens
    instructions.push(
      getTransferTokensInstruction({
        source: myTokenAccount,
        destination: theirTokenAccount,
        owner: signer,
        amount
      })
    );
    
    await sendTX(`Send tokens`, instructions);
  };
};
```

## Real Example: Wrapping SOL

Let's look at a complete example from the example-dapp:

```tsx
import { useAccount, useAssociatedTokenAccount, useKitWallet, useSendTX } from "@macalinao/grill";
import { 
  getTransferSolInstruction 
} from "@solana-program/system";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getSyncNativeInstruction,
} from "@solana-program/token";

const WSOL_MINT = address("So11111111111111111111111111111111111111112");

export async function getWrapSOLInstructions(
  signer: TransactionSendingSigner,
  amount: bigint
) {
  const owner = signer.address;
  
  // Get the wSOL ATA address
  const [ataAddress] = await findAssociatedTokenPda({
    mint: WSOL_MINT,
    owner
  });
  
  return [
    // Create ATA if it doesn't exist
    getCreateAssociatedTokenIdempotentInstruction({
      payer: signer,
      ata: ataAddress,
      owner,
      mint: WSOL_MINT
    }),
    
    // Transfer SOL to the ATA (becomes wSOL)
    getTransferSolInstruction({
      source: signer,
      destination: ataAddress,
      amount
    }),
    
    // Sync to update token balance
    getSyncNativeInstruction({
      account: ataAddress
    })
  ];
}

// Using it in a component
const WrapSOLButton = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  const [amount, setAmount] = useState("");
  
  const handleWrap = async () => {
    if (!signer || !amount) return;
    
    const lamports = BigInt(Math.floor(parseFloat(amount) * 1e9));
    const instructions = await getWrapSOLInstructions(signer, lamports);
    
    await sendTX(`Wrap ${amount} SOL`, instructions);
  };
  
  return (
    <>
      <input 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to wrap"
      />
      <button onClick={handleWrap}>Wrap SOL</button>
    </>
  );
};
```

## Advanced Transaction Options

The `sendTX` function accepts additional options:

```tsx
const signature = await sendTX("Description", instructions, {
  // Add priority fees
  computeUnitPrice: 100_000n, // microlamports per compute unit
  
  // Set compute unit limit
  computeUnitLimit: 200_000,
  
  // Skip preflight checks (use with caution)
  skipPreflight: false,
  
  // Custom confirmation strategy
  confirmationStrategy: {
    type: "blockhash",
    commitment: "confirmed"
  }
});
```

## Error Handling

Grill provides automatic error handling with helpful toast notifications:

```tsx
const RiskyButton = () => {
  const sendTX = useSendTX();
  
  const handleRiskyOperation = async () => {
    try {
      await sendTX("Risky operation", instructions);
      // Success - user sees success toast
    } catch (error) {
      // Error - user sees error toast automatically
      // You can still handle it programmatically
      console.error("Transaction failed:", error);
      
      // Maybe record to analytics
      trackEvent("transaction_failed", {
        error: error.message
      });
    }
  };
};
```

Common errors are automatically shown to users:
- "Wallet not connected"
- "User rejected the request"
- "Insufficient balance"
- "Transaction simulation failed"

## Automatic Account Refetching

After a successful transaction, you often need to refetch accounts. Grill handles this:

```tsx
const StakeButton = () => {
  const sendTX = useSendTX();
  const { data: userAccount } = useAccount({
    address: userAddress
  });
  const { data: stakingAccount } = useAccount({
    address: stakingAddress
  });
  
  const handleStake = async () => {
    // Build staking instructions
    const instructions = buildStakeInstructions();
    
    // Send transaction - accounts involved will be automatically refetched
    await sendTX("Stake SOL", instructions);
    
    // userAccount and stakingAccount will automatically update
    // No manual refetch needed!
  };
};
```

## Transaction Status Events

For custom UX, you can handle transaction status events:

```tsx
<GrillProvider
  onTransactionStatusEvent={(event) => {
    switch (event.type) {
      case "preparing":
        // Building transaction
        break;
      case "awaiting-wallet-signature":
        // Waiting for user approval
        break;
      case "waiting-for-confirmation":
        // Transaction sent, waiting for confirmation
        console.log("TX sent:", event.sig);
        console.log("Explorer:", event.explorerLink);
        break;
      case "confirmed":
        // Transaction confirmed
        console.log("Confirmed:", event.sig);
        break;
      case "error":
        // Transaction failed
        console.error("Failed:", event.error);
        break;
    }
  }}
>
```

## Composing Complex Transactions

Real DeFi operations often require multiple steps:

```tsx
const ComplexDeFiOperation = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  
  const executeDeFiStrategy = async () => {
    const instructions = [];
    
    // Step 1: Create necessary accounts
    instructions.push(
      getCreateAssociatedTokenIdempotentInstruction({
        payer: signer,
        owner: signer.address,
        mint: LP_TOKEN_MINT
      })
    );
    
    // Step 2: Swap half of USDC to SOL
    instructions.push(
      ...buildSwapInstructions(usdcAmount / 2n)
    );
    
    // Step 3: Add liquidity
    instructions.push(
      ...buildAddLiquidityInstructions()
    );
    
    // Step 4: Stake LP tokens
    instructions.push(
      ...buildStakeInstructions()
    );
    
    // One transaction, multiple operations
    await sendTX("Execute DeFi Strategy", instructions);
  };
};
```

## Priority Fees and MEV Protection

For time-sensitive transactions:

```tsx
const ArbBot = () => {
  const sendTX = useSendTX();
  
  const executeArbitrage = async () => {
    // Calculate dynamic priority fee based on opportunity
    const priorityFee = calculatePriorityFee(arbOpportunity);
    
    await sendTX("Arbitrage", instructions, {
      computeUnitPrice: priorityFee,
      computeUnitLimit: 300_000,
      skipPreflight: true // Skip for speed
    });
  };
};
```

## Versioned Transactions

For transactions that need lookup tables:

```tsx
const VersionedTxExample = () => {
  const sendTX = useSendTX();
  
  const handleVersionedTx = async () => {
    // Build instructions that reference lookup table
    const instructions = buildComplexInstructions();
    
    // sendTX handles versioned transactions automatically
    await sendTX("Complex operation", instructions);
  };
};
```

## The Wallet Context

Access the connected wallet for custom operations:

```tsx
import { useKitWallet } from "@macalinao/grill";

const WalletInfo = () => {
  const { signer, connected, isConnecting } = useKitWallet();
  
  if (isConnecting) return <div>Connecting...</div>;
  if (!connected) return <div>Not connected</div>;
  
  return (
    <div>
      <p>Address: {signer.address}</p>
      <button onClick={() => signer.signMessage(message)}>
        Sign Message
      </button>
    </div>
  );
};
```

## Best Practices

### 1. Always Provide Meaningful Descriptions

```tsx
// Bad
await sendTX("Transaction", instructions);

// Good
await sendTX("Stake 100 SOL in Marinade", instructions);
```

Users see these descriptions in their transaction history.

### 2. Validate Before Sending

```tsx
const handleSwap = async () => {
  // Validate inputs
  if (!amount || amount <= 0) {
    toast.error("Invalid amount");
    return;
  }
  
  if (amount > userBalance) {
    toast.error("Insufficient balance");
    return;
  }
  
  // Only then send transaction
  await sendTX(`Swap ${amount} tokens`, instructions);
};
```

### 3. Use Simulation for Complex Operations

```tsx
const handleComplexOperation = async () => {
  try {
    // Simulate first
    const simulation = await rpc.simulateTransaction(transaction);
    if (simulation.value.err) {
      console.error("Simulation failed:", simulation.value.err);
      return;
    }
    
    // If simulation passes, send it
    await sendTX("Complex operation", instructions);
  } catch (error) {
    // Handle simulation errors
  }
};
```

### 4. Handle Wallet Not Connected

```tsx
const ActionButton = () => {
  const { connected } = useKitWallet();
  const sendTX = useSendTX();
  
  const handleAction = async () => {
    if (!connected) {
      // Trigger wallet modal
      document.querySelector('[data-wallet-modal-button]')?.click();
      return;
    }
    
    await sendTX("Action", instructions);
  };
};
```

## Next Steps

Now you know how to read accounts and send transactions. Let's explore [advanced patterns and best practices](./05-patterns.md) for building production Solana apps with Grill.