---
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
---

Drop the `gill` and `@gillsdk/react` dependencies. Everything these packages used from them is now implemented here, directly on `@solana/kit`.

Nothing is renamed — every symbol keeps the name and signature it had, so this is a dependency change rather than an API change for consumers. What moved:

- `@macalinao/gill-extra` now owns `createSolanaClient`, `getPublicSolanaRpcUrl`, `getExplorerLink`, `getMinimumBalanceForRentExemption`, `createTransaction`, `simulateTransactionFactory`, `sendAndConfirmTransactionWithSignersFactory`, and the `SolanaClient`, `CreateTransactionInput`, `FullTransaction` and `Simplify` types.
- `@macalinao/grill` now owns `SolanaProvider` and `useSolanaClient`, backed by a small React context instead of `@gillsdk/react`.

Two behaviour notes for anyone upgrading:

- `SolanaProvider` no longer installs a `QueryClient` of its own. It previously created a fresh one on every render, which silently shadowed the `QueryClientProvider` above it; now it uses the app's query client, and takes an optional `queryClient` prop for the rare case where a separate cache is wanted.
- `useSolanaClient` throws when it is used outside a `SolanaProvider`, rather than silently falling back to a devnet client.

`gill` still declared `@solana/kit@^5` as a regular dependency while this repo is on kit 8, so the root `@solana/kit` override that forced a single hoisted copy is gone too.
