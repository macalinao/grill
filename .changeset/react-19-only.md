---
"@macalinao/grill": minor
"@macalinao/react-quarry": minor
"@macalinao/wallet-adapter-compat": minor
---

Breaking: require React 19. Compiled hooks now use React's built-in `react/compiler-runtime` instead of the `react-compiler-runtime` polyfill, removing ~6 KB min from bundles.

- The `react` (and, for `wallet-adapter-compat`, `react-dom`) peer range is now `^19` (was `^18 || ^19`).
- The `react-compiler-runtime` dependency is removed.
