---
"@macalinao/grill": minor
"@macalinao/gill-extra": minor
---

Add an optional `latestBlockhash` to the transaction send options. When provided, `sendTX` builds the transaction with the supplied blockhash instead of fetching a fresh one via `rpc.getLatestBlockhash()`, letting callers who maintain their own up-to-date blockhash skip an RPC round trip per transaction.
