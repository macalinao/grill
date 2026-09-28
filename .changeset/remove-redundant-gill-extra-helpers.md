---
"@macalinao/gill-extra": minor
"@macalinao/grill": patch
---

Remove gill-extra helpers that duplicate `@solana/kit` or other gill-extra exports.

- **Breaking (`@macalinao/gill-extra`)**: removed `getSignatureFromBytes`. Use kit directly: `signature(getBase58Decoder().decode(sigBytes))`.
- **Breaking (`@macalinao/gill-extra`)**: removed `pollConfirmTransaction` and `PollConfirmTransactionOptions`. Use `confirmTransaction` (WebSocket with a polling fallback) or `pollTransactionConfirmation`, raise a failed transaction's `err` with kit's `getSolanaErrorFromTransactionError`, and fetch the transaction with `getConfirmedTransaction` if you need it.
- `@macalinao/grill`: `createSendTX` now builds the signature with kit's `signature()` and `getBase58Decoder()` instead of `getSignatureFromBytes`.
