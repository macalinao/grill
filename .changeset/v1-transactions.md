---
"@macalinao/das-api": minor
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
"@macalinao/quarry": minor
"@macalinao/react-quarry": minor
"@macalinao/solana-batch-accounts-loader": minor
"@macalinao/solana-errors": minor
"@macalinao/token-utils": minor
"@macalinao/wallet-adapter-compat": minor
"@macalinao/zod-solana": minor
---

Add support for Solana v1 transactions, and require `@solana/kit` 8.

- **Breaking:** the `@solana/kit` peer dependency is now `^8` (was `^6 || ^7 || ^8`) in every package. The v1 transaction APIs used here were added in kit 8.
- `createTransaction` (`@macalinao/gill-extra`) accepts `version: 1`. The compute budget is now set with kit's version-aware setters: legacy and v0 transactions still get Compute Budget instructions placed before your instructions, and v1 transactions get the same values in `message.config`.
- New `createTransaction` options: `priorityFeeLamports`, the total priority fee in lamports (v1 only), and `loadedAccountsDataSizeLimit` (any version).
- `createTransaction` now throws on invalid combinations. With version 1, both `computeUnitLimit` and `loadedAccountsDataSizeLimit` are required, because an unset value budgets zero compute units or zero bytes and the transaction would fail. `computeUnitPrice` is rejected for v1 (use `priorityFeeLamports`), and `priorityFeeLamports` is rejected for legacy and v0 (use `computeUnitPrice`). `version: "auto"` still only picks legacy or v0.
- `SendTXOptions`, used by `useSendTX`/`createSendTX` in `@macalinao/grill`, adds `version` (default `0`, as before), `priorityFeeLamports` and `loadedAccountsDataSizeLimit`. `lookupTables` is only allowed with version 0. If the options are invalid, the send now fails with an error status event rather than leaving the toast on "preparing".
- `getConfirmedTransaction` requests `maxSupportedTransactionVersion: 1`, so it can fetch v1 transactions.
- `@macalinao/wallet-adapter-compat` rejects v1 transactions with a clear error. Wallet adapters take `@solana/web3.js` transactions, and web3.js can parse v1 messages but cannot serialize them. Send v1 transactions through a Wallet Standard or kit signer.
- `@solana-program/compute-budget` is no longer a runtime dependency of `@macalinao/gill-extra`.
