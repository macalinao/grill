---
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
---

Replace `createSolanaClient`/`SolanaProvider` with kit 8's plugin-based `Client` and `@solana/react`'s `ClientProvider`.

**Breaking changes**

- `@macalinao/gill-extra`: removed `createSolanaClient` and the `SolanaClient`, `CreateSolanaClientArgs`, `SolanaClientUrlOrMoniker`, `LocalnetUrl`, `ModifiedClusterUrl` and `GenericUrl` types. Build the client with `createClient().use(solanaRpcConnection(...))` from `@solana/kit` and `@solana/kit-plugin-rpc` instead.
- `@macalinao/gill-extra`: `getPublicSolanaRpcUrl` now returns kit's branded cluster URLs (`MainnetUrl`, `DevnetUrl`, `TestnetUrl`), so an RPC built from them is typed for that cluster. `"localnet"`/`"localhost"` still return the plain string `http://127.0.0.1:8899`.
- `@macalinao/grill`: removed `SolanaProvider`, `SolanaProviderProps` and grill's own client context. Grill now reads the client from `ClientProvider` in `@solana/react`, so the app shares one kit client with `@solana/react`'s hooks. `@solana/react` (`^8.3.0`) is a new peer dependency of `@macalinao/grill`. `@macalinao/grill`'s `@solana/kit` peer range is narrowed from `^6 || ^7 || ^8` to `^8.3.0`, which is what `@solana/react` requires. Upgrade kit to 8.3 or later before upgrading grill.
- `@macalinao/grill`: `useSolanaClient()` is now a typed wrapper around `@solana/react`'s `useClientCapability` and returns a `Client<GrillClient>`. The new `GrillClient` type describes the `rpc` and `rpcSubscriptions` capabilities grill needs.
- `SolanaProvider`'s optional `queryClient` prop is gone. Wrap the tree in `QueryClientProvider` yourself (the default setup already required this).

**Migration**

Before:

```tsx
import { createSolanaClient, GrillProvider, SolanaProvider } from "@macalinao/grill";

const client = createSolanaClient({ urlOrMoniker: "mainnet" });

<QueryClientProvider client={queryClient}>
  <SolanaProvider client={client}>
    {/* wallet providers */}
    <GrillProvider>{children}</GrillProvider>
  </SolanaProvider>
</QueryClientProvider>;
```

After:

```tsx
import { getPublicSolanaRpcUrl, GrillProvider } from "@macalinao/grill";
import { createClient } from "@solana/kit";
import { solanaRpcConnection } from "@solana/kit-plugin-rpc";
import { ClientProvider } from "@solana/react";

const client = createClient().use(
  solanaRpcConnection({ rpcUrl: getPublicSolanaRpcUrl("mainnet") }),
);

<QueryClientProvider client={queryClient}>
  <ClientProvider client={client}>
    {/* wallet providers */}
    <GrillProvider>{children}</GrillProvider>
  </ClientProvider>
</QueryClientProvider>;
```

`ClientProvider` also accepts a promise of a client (for async plugins) and suspends until it resolves.

**Behaviour differences from `createSolanaClient`**

- No moniker strings: `solanaRpcConnection` takes a URL. Use `getPublicSolanaRpcUrl("mainnet" | "devnet" | "testnet" | "localnet")` for the public endpoints.
- No `URL` objects: pass a string (`url.toString()`).
- No `port` options: put the port in the URL, or pass `rpcSubscriptionsUrl` when websockets are served elsewhere.
- The websocket URL is derived from the RPC URL (`http` → `ws`, `https` → `wss`). The local-validator port rewrite to 8900 applies only to the exact URLs `http://127.0.0.1:8899` and `http://localhost:8899`; any other local URL needs an explicit `rpcSubscriptionsUrl`.
- `sendAndConfirmTransaction` and `simulateTransaction` are no longer on the client. Build them when you need them with `sendAndConfirmTransactionWithSignersFactory({ rpc, rpcSubscriptions })` and `simulateTransactionFactory({ rpc })` from `@macalinao/gill-extra`.
- `urlOrMoniker` is no longer on the client. Pass `rpcUrl` to `GrillProvider` if you want transaction inspector links for a custom RPC.
