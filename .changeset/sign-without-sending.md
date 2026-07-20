---
"@macalinao/grill": minor
"@macalinao/gill-extra": minor
"@macalinao/wallet-adapter-compat": minor
---

Add `useSignTX` to sign a transaction and return the fully-signed `Transaction` without broadcasting it, when the connected wallet supports signing separately from sending. The `wallet-adapter-compat` signer is now a composite: always a `TransactionSendingSigner`, and additionally a `TransactionPartialSigner` (exposing `signTransactions`) when the wallet exposes `signTransaction`. Adds `BuildTXOptions`/`SignTXOptions`/`SignTXFunction` types and an internal shared `prepareTransactionMessage` helper used by both the send and sign paths.
