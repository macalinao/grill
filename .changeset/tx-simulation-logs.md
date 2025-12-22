---
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
---

Add transaction simulation logging with Solana Explorer inspector URLs

- Added `logTransactionSimulation` function to log detailed debugging info when simulations fail
- Automatically generates Solana Explorer inspector URLs with proper support for localhost/custom RPC endpoints
- Added `createTransactionInspectorUrlWithOptions` for creating inspector URLs with custom RPC URL support
- GrillProvider now accepts `rpcUrl` and `cluster` props for proper inspector URL generation
- Console output includes color-coded logs, inspector URL, and copy-paste debugging block
