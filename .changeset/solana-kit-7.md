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

Upgrade to `@solana/kit` v7.

The `@solana/kit` peer dependency range widens from `^6` to `^7`, so consumers must
upgrade to `@solana/kit` 7 alongside these packages. The Solana program clients used
internally move with it:

- `@solana-program/address-lookup-table` `^0.12.1` -> `^0.13.0`
- `@solana-program/system` `^0.12.2` -> `^0.13.0`
- `@solana-program/token` `^0.14.0` -> `^0.15.0`

No Grill APIs changed. None of the APIs removed in kit 7 (`ReactiveStreamStore`'s
construction-time `abortSignal` and auto-connect, `getUnifiedState`,
`getMinimumBalanceForRentExemption` from `@solana/kit`, `createEmptyClient`) were used
by these packages.
