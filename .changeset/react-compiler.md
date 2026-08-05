---
"@macalinao/grill": minor
"@macalinao/react-quarry": minor
"@macalinao/wallet-adapter-compat": minor
---

Precompile components and hooks with the React Compiler. The three packages that ship React code now run the compiler as part of their tsdown build, so consumers get the automatic memoization whether or not they run the compiler themselves.

The compiler is configured with `target: "18"` to match these packages' `react: ^18 || ^19` peer range, so the emitted code imports from the `react-compiler-runtime` polyfill (a new dependency of each package) rather than from `react/compiler-runtime`, which only exists in React 19.
