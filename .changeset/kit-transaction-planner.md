---
"@macalinao/grill": minor
"@macalinao/gill-extra": minor
---

Build and send transactions with `@solana/kit`'s instruction-plans machinery.

- `sendTX` / `signTX` now plan their instructions with kit's `createTransactionPlanner` and run the transaction through `createTransactionPlanExecutor` with grill's own sign/send/confirm step. Every existing option, status event and error behaves as before; `sendTX` still sends exactly one transaction and never splits instructions across several.
- Address lookup table compression is applied while planning, so the size checks see the compressed message. Instructions that cannot fit in one transaction now fail before the wallet is asked to sign, with kit's precise error (too many accounts, transaction too large, ...) reported as `error-transaction-send-failed` / `error-transaction-sign-failed`.
- New opt-in `estimateResourceLimits` option on `BuildTXOptions` (`SendTXOptions` / `SignTXOptions`): estimates the compute unit limit (and, for v1 transactions, the loaded accounts data size limit) from a single simulation that doubles as the preflight, with `@solana/kit-plugin-rpc`'s default margin. Explicit limits are never overridden. Off by default.
