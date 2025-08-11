# 01. Introduction: Why Grill?

## The Problem with Solana Development

Building Solana applications has always been harder than it needs to be. Every React component that needs account data fires off its own RPC request. You fetch the same account 10 times across your app? That's 10 separate RPC calls. Your RPC provider starts rate limiting you. Your app feels sluggish. Your users complain.

This isn't just about performance—it's about architecture. When every component manages its own data fetching, you end up with a mess of loading states, error boundaries, and cache invalidation logic scattered throughout your codebase. It's death by a thousand cuts.

## Enter Grill

Grill is a Solana development kit that solves these problems at their root. Built on top of [gill](https://github.com/DecalLabs/gill) and the modern @solana/kit, Grill introduces a simple but powerful innovation: **automatic account batching**.

Here's what happens when you use Grill:

1. Multiple components request account data
2. Grill automatically batches these requests within the same tick
3. One RPC call fetches all the data
4. React Query caches everything
5. Your app is fast, your code is clean

But Grill is more than just batching. It's a complete toolkit that makes Solana development feel like modern web development should.

## The Core Innovation: DataLoader Pattern for Solana

If you've built GraphQL servers, you know about DataLoader. It's Facebook's solution to the N+1 query problem. Grill brings this same pattern to Solana.

```tsx
import type { FC } from "react";
import type { Address } from "gill";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@macalinao/grill";

interface ComponentProps {
  address: Address;
}

// Without Grill: 3 separate RPC calls
const Component1: FC<ComponentProps> = ({ address }) => {
  const { data: account1 } = useQuery({
    queryFn: () => connection.getAccountInfo(address),
  });
};

const Component2: FC<ComponentProps> = ({ address }) => {
  const { data: account2 } = useQuery({
    queryFn: () => connection.getAccountInfo(address),
  });
};

const Component3: FC<ComponentProps> = ({ address }) => {
  const { data: account3 } = useQuery({
    queryFn: () => connection.getAccountInfo(address),
  });
};

// With Grill: 1 batched RPC call
const Component1: FC<ComponentProps> = ({ address }) => {
  const { data: account1 } = useAccount({ address });
};

const Component2: FC<ComponentProps> = ({ address }) => {
  const { data: account2 } = useAccount({ address });
};

const Component3: FC<ComponentProps> = ({ address }) => {
  const { data: account3 } = useAccount({ address });
};
```

The magic happens automatically. Grill coalesces all account requests within a 10ms window into a single `getMultipleAccounts` RPC call. Your components don't know or care about batching—they just get their data.

## Beyond Batching: A Modern Solana Stack

Grill isn't just about performance. It's about developer experience:

### 1. **Type-Safe Account Decoding**

```tsx
import type { FC } from "react";
import type { Address } from "gill";
import { useAccount } from "@macalinao/grill";
import { getTokenAccountDecoder } from "@solana-program/token";

interface TokenAccountDisplayProps {
  tokenAccountAddress: Address;
}

const TokenAccountDisplay: FC<TokenAccountDisplayProps> = ({ tokenAccountAddress }) => {
  const { data: tokenAccount } = useAccount({
    address: tokenAccountAddress,
    decoder: getTokenAccountDecoder(),
  });
  // tokenAccount is fully typed as TokenAccount
  
  return <div>{/* Your component JSX */}</div>;
};
```

### 2. **Automatic PDA Derivation**

```tsx
import type { FC } from "react";
import type { Address } from "gill";
import { useAssociatedTokenAccount } from "@macalinao/grill";

interface ATADisplayProps {
  usdcMint: Address;
  userAddress: Address;
}

const ATADisplay: FC<ATADisplayProps> = ({ usdcMint, userAddress }) => {
  const { data: ata } = useAssociatedTokenAccount({
    mint: usdcMint,
    owner: userAddress,
  });
  // Automatically derives the ATA address and fetches the account
  
  return <div>{/* Your component JSX */}</div>;
};
```

### 3. **Transaction Management with Toast Notifications**

```tsx
import type { FC } from "react";
import type { TransactionInstruction } from "@solana/web3.js";
import { useSendTX } from "@macalinao/grill";

interface SwapButtonProps {
  buildSwapInstructions: () => TransactionInstruction[];
}

const SwapButton: FC<SwapButtonProps> = ({ buildSwapInstructions }) => {
  const sendTX = useSendTX();

  const handleSwap = async (): Promise<void> => {
    const instructions = buildSwapInstructions();
    await sendTX("Swap USDC for SOL", instructions);
    // Automatic toast notifications for each transaction stage
  };
  
  return <button onClick={handleSwap}>Swap</button>;
};
```

### 4. **Kit Wallet Integration**

```tsx
import type { FC } from "react";
import { useKitWallet } from "@macalinao/grill";

const WalletInfo: FC = () => {
  const { signer } = useKitWallet();
  // Works with any @solana/kit compatible wallet
  
  return (
    <div>
      {signer ? (
        <p>Wallet connected: {signer.address}</p>
      ) : (
        <p>Wallet not connected</p>
      )}
    </div>
  );
};
```

## The Philosophy: Composition Over Configuration

Grill follows React's philosophy of composition. Instead of a monolithic SDK with hundreds of methods, Grill provides focused hooks that compose together:

```tsx
import type { FC } from "react";
import type { Address, TokenAccount, TransactionInstruction } from "gill";
import { useKitWallet, useAssociatedTokenAccount, useAccount, useSendTX } from "@macalinao/grill";

interface MyDeFiAppProps {
  USDC_MINT: Address;
  buildInstructions: (usdcAccount: TokenAccount) => TransactionInstruction[];
}

const MyDeFiApp: FC<MyDeFiAppProps> = ({ USDC_MINT, buildInstructions }) => {
  // Get the user's wallet
  const { signer } = useKitWallet();

  // Fetch their token accounts (batched automatically)
  const { data: usdcAccount } = useAssociatedTokenAccount({
    mint: USDC_MINT,
    owner: signer?.address,
  });

  const { data: solAccount } = useAccount({
    address: signer?.address,
  });

  // Send transactions with automatic status updates
  const sendTX = useSendTX();

  // Everything composes naturally
  const handleAction = async (): Promise<void> => {
    if (!signer || !usdcAccount) return;

    const instructions = buildInstructions(usdcAccount.data);
    await sendTX("Perform DeFi Action", instructions);
  };
  
  return (
    <div>
      <button onClick={handleAction} disabled={!signer || !usdcAccount}>
        Perform DeFi Action
      </button>
    </div>
  );
};
```

## Performance That Matters

Let's talk numbers. A typical DeFi interface might fetch:

- User's SOL balance
- 5-10 token accounts
- LP positions across 3-4 pools
- Staking accounts
- Governance tokens

Without batching: **15-20 RPC calls on page load**
With Grill: **2-3 batched RPC calls**

That's not just faster—it's the difference between hitting rate limits and not. It's the difference between a spinner-filled UI and instant data.

## Why Not Just Use @solana/kit Directly?

@solana/kit (formerly web3.js v2) is a great low-level library. But it's exactly that—low level. You still need to:

- Implement your own batching logic
- Integrate with React Query
- Build transaction status management
- Handle wallet adapter compatibility
- Create your own account decoding patterns

Grill gives you all of this out of the box, while remaining fully compatible with @solana/kit. You can drop down to the kit level whenever you need to.

## The Bottom Line

Grill makes building Solana apps feel like building modern React apps. No more manual RPC management. No more N+1 problems. No more boilerplate. Just clean, fast, composable code.

In the next section, we'll get Grill set up in your project and show you how to migrate incrementally from your existing Solana code.
