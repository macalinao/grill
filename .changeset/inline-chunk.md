---
"@macalinao/solana-batch-accounts-loader": patch
---

Drop the `lodash-es` dependency by inlining the one `chunk` call it was used for. This roughly halves the package's bundled size (~4.9 KB to ~2.5 KB minified) with no behaviour change.
