---
"@macalinao/solana-batch-accounts-loader": patch
"@macalinao/wallet-adapter-compat": patch
"@macalinao/dataloader-es": patch
"@macalinao/react-quarry": patch
"@macalinao/token-utils": patch
"@macalinao/gill-extra": patch
"@macalinao/zod-solana": patch
"@macalinao/quarry": patch
"@macalinao/grill": patch
---

Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.
