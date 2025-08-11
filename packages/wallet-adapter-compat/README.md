# @macalinao/wallet-adapter-compat

[![npm version](https://img.shields.io/npm/v/@macalinao/wallet-adapter-compat.svg)](https://www.npmjs.com/package/@macalinao/wallet-adapter-compat)

Compatibility layer that bridges @solana/wallet-adapter with @solana/kit and grill.

## Purpose

This package provides compatibility between the traditional Solana wallet adapter pattern and the modern @solana/kit approach. It:

1. Converts wallet-adapter wallets into Kit's `TransactionSendingSigner`
2. Provides the `WalletAdapterCompatProvider` that automatically creates signers and integrates with grill's `WalletProvider`
3. Maintains backward compatibility for existing wallet-adapter code

## Installation

```bash
npm install @macalinao/wallet-adapter-compat @macalinao/grill
```

## Usage

### Using WalletAdapterCompatProvider

The easiest way to integrate is using `WalletAdapterCompatProvider`, which automatically creates a `TransactionSendingSigner` from your connected wallet:

```tsx
import { WalletAdapterCompatProvider } from "@macalinao/wallet-adapter-compat";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useKitWallet } from "@macalinao/grill";

function App() {
  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletAdapterCompatProvider>
            <MyComponent />
          </WalletAdapterCompatProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MyComponent() {
  // Now you can use Kit wallet hooks from grill
  const { signer, rpc } = useKitWallet();

  if (!signer) {
    return <div>Please connect your wallet</div>;
  }

  // Use signer for transactions with @solana/kit
}
```

### Manual Signer Creation

For more control, you can manually create a `TransactionSendingSigner`:

```tsx
import { createWalletTransactionSendingSigner } from "@macalinao/wallet-adapter-compat";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@macalinao/grill";

function MyProvider({ children }) {
  const wallet = useWallet();
  const { connection } = useConnection();

  const signer = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null;
    return createWalletTransactionSendingSigner(wallet, connection);
  }, [wallet, connection]);

  return <WalletProvider signer={signer}>{children}</WalletProvider>;
}
```

## API

### Components

- `WalletAdapterCompatProvider` - Automatic provider that creates signers and integrates with grill

### Functions

- `createWalletTransactionSendingSigner(wallet, connection)` - Creates a Kit-compatible signer from a wallet adapter

### Legacy Hooks

- `useSendTX()` - Legacy transaction sending hook (use Kit's transaction methods instead)

## Migration Guide

### From wallet-adapter to Kit

1. Wrap your app with `WalletAdapterCompatProvider`
2. Replace wallet adapter transaction methods with Kit's transaction API
3. Use `useKitWallet()` from grill to access the signer

```tsx
// Before (wallet-adapter)
const { sendTransaction } = useWallet();
await sendTransaction(transaction, connection);

// After (with Kit)
const { signer } = useKitWallet();
await signer.signAndSendTransactions([transaction]);
```

## Features

- 🔄 Seamless wallet-adapter to Kit conversion
- 🔐 Maintains wallet security practices
- 📦 Zero configuration with WalletAdapterCompatProvider
- 🛠️ Manual control when needed

## License

Apache-2.0
