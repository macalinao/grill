---
"@macalinao/privy-compat": minor
---

Add @macalinao/privy-compat, which signs grill transactions with a Privy embedded Solana wallet.

- `PrivyGrillProvider` wires the user's Privy wallet into grill's `WalletProvider`, so `useSendTX` and the other grill hooks sign through Privy.
- `useCreatePrivyWallet` creates an embedded Solana wallet and returns its Kit `Address`.
- `usePrivySigner` and `createPrivyTransactionSendingSigner` build the Kit `TransactionSendingSigner` directly, for apps that do not want the provider.
- `getPrivySolanaChain` converts a gill `SolanaCluster` to Privy's CAIP-2 chain identifier.
