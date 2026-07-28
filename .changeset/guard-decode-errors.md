---
"@macalinao/solana-batch-accounts-loader": minor
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
---

Guard account decode errors, and make React Query the single source of truth for account data.

### Account data is no longer memoized forever

`createBatchAccountsLoader` previously used DataLoader's default `cache: true`, giving it a permanent, unbounded per-address cache for the lifetime of the provider. Because every read goes through the loader, this silently shadowed React Query: `invalidateQueries`, `refetch()`, `staleTime`, `refetchOnMount` and `refetchOnWindowFocus` would all re-run the query function only to replay the same cached bytes. Account data was effectively frozen until `refetchAccounts` was called explicitly.

The loader now defaults to `cache: false`, making it a **pure request coalescer**: concurrent loads are still batched into a single `getMultipleAccounts` call (still chunked at 99), but nothing is retained afterwards. Duplicate addresses within a batch are deduped so they don't consume slots. React Query is now the only cache, so standard invalidation actually refetches from the RPC.

- Pass `cache: true` to `createBatchAccountsLoader` to restore the old memoizing behavior (only advisable for short-lived loaders).
- **Note:** accounts now respect `staleTime` (React Query's default is `0`). Set a `staleTime` on your `QueryClient` to trade freshness for fewer RPC calls.
- Fixes a latent bug where a failed chunk returned a single `Error` for the whole chunk, misaligning the results array with the requested keys (DataLoader requires one result per key).

### Forcing a refresh no longer requires a hook

`createAccountQueryKey(address)` is a plain function, so you can now refresh an account from anywhere you have a `QueryClient` — a mutation callback, an event handler, a service module — with no React context:

```ts
await queryClient.invalidateQueries({
  queryKey: createAccountQueryKey(address),
  exact: true,
});
```

New `useRefetchAccount()` / `useRefetchAccounts()` hooks are available as convenience sugar for use inside components. Both refresh only the addresses passed. Documented in the README.

### Decode errors are guarded

- New `AccountDecodeError` (from `@macalinao/gill-extra`, re-exported by `@macalinao/grill`). When a decoder throws, the raw failure is wrapped with the account's `address` and `programAddress` (owner) so it can be traced to a specific on-chain account instead of an opaque "index out of bounds"-style message. The original error is kept as `.cause`.
- `useAccount`/`useAccounts` decode failures now surface as an `AccountDecodeError` on the query's `error` instead of an unlabeled throw.
- Subscription decodes are now guarded per-notification: a malformed `accountNotifications` update is logged (with address/owner context) and skipped, keeping the last good value in the cache and leaving the subscription running, rather than tearing it down.
