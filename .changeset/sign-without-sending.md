---
"@macalinao/grill": minor
"@macalinao/gill-extra": minor
"@macalinao/wallet-adapter-compat": minor
---

Add `useSignTX`, which signs a transaction and returns the fully-signed `Transaction` without broadcasting it — for handing a transaction to a backend/relayer, combining it with additional signers, or sending it later. It requires a wallet that supports signing separately from sending; otherwise the returned promise rejects.

- `@macalinao/grill`
  - New `useSignTX` hook, plus `signed` and `error-transaction-sign-failed` transaction status events with matching `GrillProvider` toasts.
  - `useSignTX` builds its signing function itself rather than reading one off `GrillContext`, so the signing code stays out of `GrillProvider`'s import graph. Apps that never import `useSignTX` do not pay for it — bundlers drop it entirely.
  - `GrillContextValue` now also carries the provider's `onTransactionStatusEvent`, `rpcUrl`, and `cluster`, which is what lets hooks build their own transaction functions.
  - The `GrillSigner` type moved from `contexts/wallet-context.ts` to the package's shared `types` module. It is still exported from the package root, so imports from `@macalinao/grill` are unaffected.
- `@macalinao/gill-extra`: new `BuildTXOptions`, `SignTXOptions`, and `SignTXFunction` types.
- `@macalinao/wallet-adapter-compat`: the signer created from a wallet adapter is now a composite — always a `TransactionSendingSigner`, and additionally a `TransactionPartialSigner` (exposing `signTransactions`) when the wallet exposes `signTransaction`. It also no longer logs every transaction's wire bytes to the console.
