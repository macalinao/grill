---
"@macalinao/grill": patch
---

Widen the `@tanstack/react-query` peer range from `^5.102.8` to `^5.66.9`.

Nothing in this package needs a 5.102.x release — it only uses `useQuery`,
`useQueries` (with `combine`), `useQueryClient`, and the `QueryClient` cache
methods. `5.66.9` is the lowest v5 release the package type-checks against: it
shipped the improved `useQueries` inference for dynamically built query arrays
(TanStack Query PR #8624), which `useAccounts` and `useTokenInfos` rely on.
Apps pinned anywhere in 5.66.9 – 5.102.7 no longer get a spurious peer conflict.
