# @macalinao/privy-compat

[![npm version](https://img.shields.io/npm/v/@macalinao/privy-compat.svg)](https://www.npmjs.com/package/@macalinao/privy-compat)

Sign grill transactions with a [Privy](https://privy.io) embedded Solana wallet.

Privy gives users a wallet without a browser extension or a seed phrase: they log in with an email, a social account, or a passkey, and Privy creates and custodies a Solana wallet for them. This package turns that wallet into a [`TransactionSendingSigner`](https://www.solanakit.com/api/type-aliases/TransactionSendingSigner) from `@solana/kit`, and hands it to grill -- so `useSendTX` and every other grill hook works exactly as it does with a browser wallet.

## Installation

```bash
bun add @macalinao/privy-compat @macalinao/grill @privy-io/react-auth
```

`@macalinao/grill`, `@privy-io/react-auth`, `@solana/kit`, and `react` are peer dependencies.

## Setup

Two things have to be true before grill can sign anything: the user must be logged into Privy, and they must have a Solana wallet.

Tell Privy to create one automatically at login:

```tsx
import { PrivyProvider } from "@privy-io/react-auth";

<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    embeddedWallets: {
      solana: {
        // Every user who logs in without a wallet gets one.
        createOnLogin: "users-without-wallets",
      },
    },
  }}
>
  <App />
</PrivyProvider>;
```

Then wire the wallet into grill with `PrivyGrillProvider`. It goes **inside** Privy's provider and **outside** `GrillProvider`, because `GrillProvider` reads the signer from the wallet context that `PrivyGrillProvider` supplies:

```tsx
import { GrillProvider } from "@macalinao/grill";
import { PrivyGrillProvider } from "@macalinao/privy-compat";
import { PrivyProvider } from "@privy-io/react-auth";
import { SolanaProvider } from "@gillsdk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSolanaClient } from "gill";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({ urlOrMoniker: "mainnet-beta" });

export function App() {
  return (
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID} config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider client={solanaClient}>
          <PrivyGrillProvider chain="solana:mainnet">
            <GrillProvider>
              <YourApp />
              <Toaster position="bottom-right" />
            </GrillProvider>
          </PrivyGrillProvider>
        </SolanaProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
```

That is the whole integration. Grill hooks now sign and send through Privy:

```tsx
import { useSendTX } from "@macalinao/grill";

function TransferButton({ instruction }) {
  const sendTX = useSendTX();

  return (
    <button onClick={() => sendTX("Transfer", [instruction])}>Transfer</button>
  );
}
```

Privy signs and submits the transaction in a single step, so the user sees one Privy confirmation instead of a wallet popup.

## Creating a wallet

If you would rather create the wallet yourself -- behind a button, after onboarding, or as a second wallet -- use `useCreatePrivyWallet`. It wraps Privy's `useCreateWallet` and returns the new wallet's address as a Kit `Address`:

```tsx
import { useCreatePrivyWallet } from "@macalinao/privy-compat";
import { usePrivy } from "@privy-io/react-auth";

function CreateWalletButton() {
  const { authenticated, login } = usePrivy();
  const { createWallet } = useCreatePrivyWallet();

  if (!authenticated) {
    return <button onClick={login}>Log in</button>;
  }

  const onClick = async () => {
    const address = await createWallet();
    console.log("created", address);
  };

  return <button onClick={onClick}>Create wallet</button>;
}
```

Once the wallet exists, `PrivyGrillProvider` picks it up on the next render and grill can sign with it -- no reload, no reconnect.

`createWallet` rejects if the user is not authenticated, if they already have an embedded wallet (pass `{ createAdditional: true }` to give them another), or if they close the Privy modal. The error from Privy is propagated unchanged, so you can show it to the user.

## Choosing a wallet

A user can have more than one Privy wallet. By default the first one signs. To pick a specific one, pass its address:

```tsx
<PrivyGrillProvider address={selectedAddress}>
  <GrillProvider>{children}</GrillProvider>
</PrivyGrillProvider>
```

Privy's own `useWallets` hook lists them:

```tsx
import { useWallets } from "@privy-io/react-auth/solana";

const { ready, wallets } = useWallets();
```

If no wallet matches the address you asked for, the signer is `null` -- grill treats that as "wallet not connected" and `sendTX` throws rather than signing with the wrong account.

## Clusters

Privy addresses clusters by their CAIP-2 identifier, not by gill's cluster names. `getPrivySolanaChain` converts:

```tsx
import { getPrivySolanaChain } from "@macalinao/privy-compat";

getPrivySolanaChain("mainnet-beta"); // "solana:mainnet"
getPrivySolanaChain("devnet"); // "solana:devnet"
getPrivySolanaChain("testnet"); // "solana:testnet"
getPrivySolanaChain("localnet"); // throws: Privy cannot reach a local validator
```

Useful when the cluster is configuration rather than a literal:

```tsx
<PrivyGrillProvider chain={getPrivySolanaChain(cluster)}>
```

Privy submits the transaction through its own RPC for that cluster, which is why `localnet` has no equivalent: use a wallet adapter (see [@macalinao/wallet-adapter-compat](../wallet-adapter-compat)) against a local validator.

## Send options

`options` is forwarded to Privy on every transaction:

```tsx
<PrivyGrillProvider
  options={{
    skipPreflight: true,
    commitment: "confirmed",
    maxRetries: 3,
    // Requires gas sponsorship to be configured in your Privy dashboard.
    sponsor: true,
  }}
>
```

Memoize the object if you build it inline -- a new object on every render produces a new signer on every render.

## Building the signer yourself

`PrivyGrillProvider` is a thin wrapper over `usePrivySigner`, which is itself a thin wrapper over `createPrivyTransactionSendingSigner`. Reach for the lower layers when you need to do something in between.

Use the hook if you want the signer but not grill's `WalletProvider`:

```tsx
import { usePrivySigner } from "@macalinao/privy-compat";

const signer = usePrivySigner({ chain: "solana:devnet" });
// null until Privy is ready and the user has a wallet
```

Use the function outside of React, or with a wallet you already have in hand:

```ts
import { createPrivyTransactionSendingSigner } from "@macalinao/privy-compat";
import {
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";

const { wallets } = useWallets();
const { signAndSendTransaction } = useSignAndSendTransaction();

const signer = createPrivyTransactionSendingSigner({
  wallet: wallets[0],
  signAndSendTransaction,
  chain: "solana:mainnet",
});
```

The signer serializes each transaction to its wire format, hands it to Privy, and returns the signature Privy produced. Transactions in a batch are sent one at a time, so signatures come back in the order the transactions were given, and an aborted `AbortSignal` stops the ones that have not been sent yet.

## API

### Components

- **`PrivyGrillProvider`** -- renders grill's `WalletProvider` with a signer built from the user's Privy wallet. Props: `address`, `chain`, `options`, `children`.

### Hooks

- **`usePrivySigner(options?)`** -- the Kit `TransactionSendingSigner` for the user's Privy wallet, or `null` if there is not one yet. Stable across re-renders.
- **`useCreatePrivyWallet()`** -- `{ createWallet }`, which creates an embedded Solana wallet and resolves to its `Address`.

### Functions

- **`createPrivyTransactionSendingSigner(params)`** -- builds a `TransactionSendingSigner` from a Privy wallet and Privy's `signAndSendTransaction`. Throws if the wallet's address is not a valid Solana address.
- **`getPrivySolanaChain(cluster)`** -- converts a gill `SolanaCluster` to Privy's CAIP-2 chain identifier. Throws on `localnet`.

### Types

`PrivySolanaChain`, `PrivySolanaWallet`, `PrivyTransactionCommitment`, `PrivySignAndSendTransactionOptions`, `PrivySignAndSendTransactionInput`, `PrivySignAndSendTransactionOutput`, `PrivySignAndSendTransactionFn`, `UsePrivySignerOptions`, `PrivyGrillProviderProps`, `CreatePrivyWalletOptions`, `UseCreatePrivyWalletResult`, `CreatePrivyTransactionSendingSignerParams`.

## How it differs from a browser wallet

| | Browser wallet (`wallet-adapter-compat`) | Privy (`privy-compat`) |
| --- | --- | --- |
| User needs an extension | Yes | No |
| Who holds the key | The user's wallet | Privy, on the user's behalf |
| Signing UX | Wallet popup | Privy modal, or silent for TEE wallets |
| Transaction submission | The wallet's RPC | Privy's RPC for the chosen cluster |
| Fee sponsorship | No | Yes, with `options.sponsor` |

Both produce the same `TransactionSendingSigner`, so grill code does not change when you switch between them, and an app can offer both.

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
