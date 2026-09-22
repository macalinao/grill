---
"@macalinao/das-api": patch
"@macalinao/gill-extra": patch
"@macalinao/grill": patch
"@macalinao/quarry": patch
"@macalinao/wallet-adapter-compat": patch
"@macalinao/zod-solana": patch
---

Update dependencies:

- `@solana/kit` to `^8.3.0` and `@solana/webcrypto-ed25519-polyfill` to `8.3.0` (`@macalinao/wallet-adapter-compat`). The `@solana/kit` peer range stays `^6 || ^7 || ^8`.
- `@solana-programs/token-metadata` to `^0.8.0` (`@macalinao/gill-extra`, `@macalinao/grill`) and `@solana-programs/quarry` to `^0.7.0` (`@macalinao/quarry`).
- `@solana/wallet-adapter-base` to `^0.9.28` and `@solana/wallet-adapter-react` to `^0.15.40` (`@macalinao/wallet-adapter-compat` peer deps), plus `@solana/web3.js` to `^1.99.0` for development.
- `zod` to `^4.6.5` (`@macalinao/das-api`, `@macalinao/zod-solana`). The `zod` peer range stays `^4`.
- React 19.3 and its type packages, and build tooling: `tsdown` to `^0.23.0`, `@types/bun` to `^1.4.2`.
