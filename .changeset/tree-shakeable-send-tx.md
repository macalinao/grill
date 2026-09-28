---
"@macalinao/grill": minor
---

`useSendTX` now builds its send function in the hook instead of reading it from `GrillProvider`'s context, so the transaction-sending code (preparation, simulation, confirmation) is tree-shaken from apps that never send transactions. `GrillHeadlessProvider` drops from ~27.9 KB to ~8.2 KB minified.

- **Breaking:** `sendTX` is removed from `GrillContextValue`. Use `useSendTX()` instead of `useGrillContext().sendTX`.
- `useSendTX` and `useSignTX` rely on the React Compiler (which the package is built with) for memoization.
