---
"@macalinao/wallet-adapter-compat": major
"@macalinao/react-quarry": major
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
"@macalinao/quarry": minor
"@macalinao/solana-batch-accounts-loader": minor
"@macalinao/token-utils": minor
"@macalinao/zod-solana": minor
---

Upgrade to `@solana/kit` v6 and refresh dependencies.

**Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.

- Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
- Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
- Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

> Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.
