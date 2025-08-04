# @macalinao/wallet-adapter

Solana wallet adapter integration for [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2) with modern transaction handling.

## Installation

```bash
bun add @macalinao/wallet-adapter
```

## Features

- 🔐 Seamless wallet adapter integration with @solana/kit
- 📝 Modern transaction signing with TransactionMessage API
- 🎯 Type-safe transaction building
- 📊 Built-in transaction confirmation
- 🔔 Toast notifications for transaction status
- ⚡ Support for versioned transactions and lookup tables

## Usage

### Basic Setup

```tsx
import { SendTXProvider, useSendTX } from "@macalinao/wallet-adapter";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

function App() {
  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <SendTXProvider>
            {/* Your app components */}
          </SendTXProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Sending Transactions

```tsx
import { useSendTX } from "@macalinao/wallet-adapter";
import { address, pipe, createTransferInstruction } from "@solana/kit";

function TransferButton() {
  const sendTX = useSendTX();

  const handleTransfer = async () => {
    const instruction = pipe(
      createTransferInstruction({
        source: address("source..."),
        destination: address("dest..."),
        lamports: 1000000n,
      })
    );

    try {
      const result = await sendTX("Transfer SOL", [instruction]);
      console.log("Success! Signature:", result?.signature);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return <button onClick={handleTransfer}>Transfer 0.001 SOL</button>;
}
```

### Using Additional Signers

```tsx
import { useSendTX } from "@macalinao/wallet-adapter";
import { generateKeyPairSigner } from "@solana/kit";

function CreateAccount() {
  const sendTX = useSendTX();

  const handleCreate = async () => {
    const newAccount = await generateKeyPairSigner();
    
    const instructions = [
      // Your instructions here
    ];

    const result = await sendTX("Create Account", instructions, {
      signers: [newAccount],
    });
  };

  return <button onClick={handleCreate}>Create Account</button>;
}
```

### Using Address Lookup Tables

```tsx
import { useSendTX } from "@macalinao/wallet-adapter";
import { address } from "@solana/kit";

function ComplexTransaction() {
  const sendTX = useSendTX();

  const handleTransaction = async () => {
    const instructions = [/* your instructions */];
    
    const result = await sendTX("Complex Transaction", instructions, {
      luts: {
        "LUT11111111111111111111111111111111111111": [
          address("Address1..."),
          address("Address2..."),
        ],
      },
    });
  };

  return <button onClick={handleTransaction}>Execute</button>;
}
```

## API Reference

### Hooks

#### `useSendTX()`

Returns a function to send transactions with automatic signing and confirmation.

```typescript
const sendTX: (
  name: string,
  instructions: readonly Instruction[],
  options?: SendTXOptions
) => Promise<SendTXResult | undefined>
```

**Parameters:**
- `name` - Display name for the transaction (shown in toasts)
- `instructions` - Array of transaction instructions
- `options` - Optional configuration
  - `signers` - Additional transaction signers
  - `luts` - Address lookup tables

**Returns:**
- `SendTXResult` with signature, or `undefined` if cancelled

### Providers

#### `SendTXProvider`

Context provider for transaction sending functionality. Wrap your app with this provider to enable the `useSendTX` hook.

### Utilities

#### `createWalletTransactionSigner(wallet)`

Creates a TransactionSigner from a wallet adapter instance for use with @solana/kit.

#### `buildTransactionMessage(options)`

Builds a transaction message with proper fee payer and blockhash configuration.

## License

Apache-2.0