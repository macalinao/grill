---
"@macalinao/das-api": patch
"@macalinao/gill-extra": patch
"@macalinao/grill": patch
"@macalinao/quarry": patch
"@macalinao/react-quarry": patch
"@macalinao/solana-batch-accounts-loader": patch
"@macalinao/solana-errors": patch
"@macalinao/token-utils": patch
"@macalinao/wallet-adapter-compat": patch
"@macalinao/zod-solana": patch
---

Update dependencies to their latest versions:

- Move to `@solana/kit` v8. The `@solana/kit` peer range widens to `^6 || ^7 || ^8`, so v7 consumers are unaffected.
- Migrate the Codama-generated program clients to their new `@solana-programs/*` scope: `@macalinao/clients-quarry` becomes `@solana-programs/quarry`, `@macalinao/clients-token-metadata` becomes `@solana-programs/token-metadata`, and `@macalinao/clients-meteora-damm-v2` becomes `@solana-programs/meteora-damm-v2`. The packages are identical apart from the name, so the generated types and instruction builders `@macalinao/quarry` re-exports are unchanged.
- Bump the SPL program clients that kit v8 requires: `@solana-program/system` to `^0.14.1`, `@solana-program/address-lookup-table` to `^0.14.1`, `@solana-program/token` to `^0.16.1`, and `@solana/webcrypto-ed25519-polyfill` to `8.2.0`.
- Bump `@tanstack/react-query` to `^5.102.8`, `zod` to `^4.5.4`, and the React 19 type packages.
