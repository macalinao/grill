---
"@macalinao/zod-solana": minor
---

Add `signatureSchema` and `blockhashSchema` for validating base58-encoded Solana
transaction signatures and blockhashes. Both parse a string and transform it into
the corresponding branded `@solana/kit` type (`Signature` / `Blockhash`).
