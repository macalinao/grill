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

Add support for `@solana/kit` v7.

The `@solana/kit` peer dependency range widens from `^6` to `^6 || ^7`, so this is not a
breaking change — projects still on kit 6 keep working, and projects on kit 7 are now
supported. Every package is typechecked and tested against both majors.

The Solana program clients used internally move to their kit-7 releases:

- `@solana-program/address-lookup-table` `^0.12.1` -> `^0.13.0`
- `@solana-program/system` `^0.12.2` -> `^0.13.0`
- `@solana-program/token` `^0.14.0` -> `^0.15.0`

These declare `@solana/kit: ^7.0.0` as their own peer, so on kit 6 your package manager
will warn about an unsatisfied peer range for them. Their types are compatible with kit 6
in the ways Grill uses them, but kit 7 is the recommended target.

No Grill APIs changed. None of the APIs removed in kit 7 (`ReactiveStreamStore`'s
construction-time `abortSignal` and auto-connect, `getUnifiedState`,
`getMinimumBalanceForRentExemption` from `@solana/kit`, `createEmptyClient`) were used
by these packages.
