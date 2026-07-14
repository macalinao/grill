---
"@macalinao/grill": patch
"@macalinao/gill-extra": patch
"@macalinao/dataloader-es": patch
"@macalinao/das-api": patch
"@macalinao/wallet-adapter-compat": patch
"@macalinao/react-quarry": patch
"@macalinao/solana-batch-accounts-loader": patch
"@macalinao/quarry": patch
"@macalinao/token-utils": patch
---

Fix correctness issues surfaced by stricter type-aware lint rules.

- `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
- `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
- `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
- `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
- `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.
