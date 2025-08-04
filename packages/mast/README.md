# @macalinao/mast

Complete toolkit for building Solana applications with React and [@solana/kit](https://github.com/solana-developers/solana-web3.js-v2).

This is a barrel package that exports both `@macalinao/mast-query` and `@macalinao/wallet-adapter`.

## Installation

```bash
bun add @macalinao/mast
```

## Features

All features from both packages:
- ⚡ Efficient account batching and caching
- 🔐 Seamless wallet adapter integration
- 📊 React Query integration
- 🎯 Type-safe transaction building
- 🔔 Transaction status notifications
- 🎣 React hooks for Solana development

## Usage

```tsx
import { 
  MastProvider, 
  SendTXProvider, 
  useMast, 
  useSendTX,
  useAccountData,
  usePubkey 
} from "@macalinao/mast";
import { createSolanaRpc } from "@solana/kit";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const endpoint = "https://api.mainnet-beta.solana.com";
const rpc = createSolanaRpc(endpoint);

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <MastProvider rpc={rpc}>
              <SendTXProvider>
                <YourApp />
              </SendTXProvider>
            </MastProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function YourApp() {
  const { fetchAccount } = useMast();
  const sendTX = useSendTX();
  const systemProgram = usePubkey("11111111111111111111111111111111");
  const { data } = useAccountData(systemProgram);

  // Your app logic here
}
```

## Documentation

For detailed documentation, see:
- [@macalinao/mast-query](https://github.com/macalinao/use-solana-kit/tree/main/packages/mast-query)
- [@macalinao/wallet-adapter](https://github.com/macalinao/use-solana-kit/tree/main/packages/wallet-adapter)

## License

Apache-2.0