---
"@macalinao/solana-batch-accounts-loader": minor
"@macalinao/grill": patch
---

Replace derived types with explicit named types from the granular `@solana/*` packages:

- `@macalinao/solana-batch-accounts-loader`: `RpcWithGetMultipleAccounts` is now declared as `Rpc<GetMultipleAccountsApi>` instead of being derived from `fetchEncodedAccounts`'s parameter type. The shape is unchanged; `@solana/rpc-api` and `@solana/rpc-spec` are now peer dependencies.
- `@macalinao/grill`: internal helpers use `SimulateTransactionFunction` instead of `ReturnType<typeof simulateTransactionFactory>`. No public type changes.
