---
"@macalinao/grill": patch
---

`GrillProvider` and `GrillHeadlessProvider` no longer pull the `react-compiler-runtime` polyfill (~6 KB min) into bundles that don't use compiled hooks. `useSolanaClient` now passes a module-level options object to `useClientCapability`, so the React Compiler has nothing to memoize there. `GrillHeadlessProvider` drops from 16.6 KB to 10.3 KB min (6.7 KB to 4.4 KB gzip).
