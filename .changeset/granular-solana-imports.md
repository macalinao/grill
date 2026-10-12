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

Import from the granular `@solana/*` packages instead of the `@solana/kit` umbrella, and bump Solana dependencies.

- Every package now imports each symbol from the `@solana/*` package that declares it (`@solana/addresses`, `@solana/keys`, `@solana/rpc-types`, `@solana/transaction-messages`, ...) and declares those packages as peer dependencies (`^8.4.0`). They ship in lockstep with `@solana/kit`, so installing `@solana/kit@^8.4.0` already provides them; with strict installers (pnpm without `auto-install-peers`) add them to your app.
- `@solana/kit` is no longer a peer dependency of `das-api`, `react-quarry`, `solana-batch-accounts-loader`, `solana-errors`, `token-utils`, `wallet-adapter-compat` and `zod-solana`. `gill-extra`, `grill` and `quarry` still peer on it.
- The `@solana/kit` and `@solana/react` peer ranges are now `^8.4.0`.
- Bumped `@solana-program/address-lookup-table` to 0.15, `@solana-program/system` to 0.15, `@solana-program/token` to 0.17, `@solana-programs/token-metadata` to 0.9 and `@solana-programs/quarry` to 0.8, and `@solana/webcrypto-ed25519-polyfill` to 8.4.
