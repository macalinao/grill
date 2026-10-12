# @macalinao/wallet-adapter-compat

[![npm version](https://img.shields.io/npm/v/@macalinao/wallet-adapter-compat.svg)](https://www.npmjs.com/package/@macalinao/wallet-adapter-compat)

Compatibility layer that bridges @solana/wallet-adapter with @solana/kit and grill.

## Purpose

This package provides compatibility between the traditional Solana wallet adapter pattern and the modern @solana/kit approach. It:

1. Converts wallet-adapter wallets into Kit's `TransactionSendingSigner`
2. Provides `WalletAdapterCompatProvider`, which writes that signer to the kit client's `payer` and `identity` (via grill's `reactiveSigner()` plugin) as the wallet connects and disconnects
3. Maintains backward compatibility for existing wallet-adapter code

## Installation

```bash
npm install @macalinao/wallet-adapter-compat @macalinao/grill @solana/react
```

## Usage

### Using WalletAdapterCompatProvider

Install grill's `reactiveSigner()` plugin on your kit client, then render `WalletAdapterCompatProvider` inside both `ClientProvider` and wallet-adapter's providers:

```tsx
import { reactiveSigner, useWalletSigner } from "@macalinao/grill";
import { WalletAdapterCompatProvider } from "@macalinao/wallet-adapter-compat";
import { createClient } from "@solana/kit";
import { solanaRpcConnection } from "@solana/kit-plugin-rpc";
import { ClientProvider } from "@solana/react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

const client = createClient()
  .use(solanaRpcConnection({ rpcUrl: "https://api.mainnet-beta.solana.com" }))
  .use(reactiveSigner());

function App() {
  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ClientProvider client={client}>
            <WalletAdapterCompatProvider>
              <MyComponent />
            </WalletAdapterCompatProvider>
          </ClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MyComponent() {
  // The connected wallet is the client's payer. `usePayer(client)` from
  // @solana/react works too.
  const signer = useWalletSigner();

  if (!signer) {
    return <div>Please connect your wallet</div>;
  }

  // Use signer for transactions with @solana/kit
}
```

### Manual Signer Creation

For more control, you can create the `TransactionSendingSigner` yourself and put it on the client:

```tsx
import type { ClientWithReactiveSigner } from "@macalinao/grill";
import { createWalletTransactionSendingSigner } from "@macalinao/wallet-adapter-compat";
import { useClient } from "@solana/react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

function MySignerSync() {
  const client = useClient<ClientWithReactiveSigner>();
  const wallet = useWallet();
  const { connection } = useConnection();

  const signer = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null;
    return createWalletTransactionSendingSigner(wallet, connection);
  }, [wallet, connection]);

  useEffect(() => {
    client.setSigner(signer);
  }, [client, signer]);

  return null;
}
```

## API

### Components

- `WalletAdapterCompatProvider` - Syncs the connected wallet-adapter wallet to the kit client's `payer`/`identity`

### Functions

- `createWalletTransactionSendingSigner(wallet, connection)` - Creates a Kit-compatible signer from a wallet adapter

## Migration Guide

### From wallet-adapter to Kit

1. Install `reactiveSigner()` on your kit client and render `WalletAdapterCompatProvider` inside `ClientProvider`
2. Replace wallet adapter transaction methods with Kit's transaction API
3. Use `useWalletSigner()` from grill (or `usePayer(client)` from `@solana/react`) to access the signer

```tsx
// Before (wallet-adapter)
const { sendTransaction } = useWallet();
await sendTransaction(transaction, connection);

// After (with Kit)
const signer = useConnectedWallet();
await signer.signAndSendTransactions([transaction]);
```

## Features

- 🔄 Seamless wallet-adapter to Kit conversion
- 🔐 Maintains wallet security practices
- 📦 Zero configuration with WalletAdapterCompatProvider
- 🛠️ Manual control when needed

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
