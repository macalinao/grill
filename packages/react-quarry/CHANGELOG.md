# @macalinao/react-quarry

## 12.1.0

### Minor Changes

- b944b52: Replace `createSolanaClient`/`SolanaProvider` with kit 8's plugin-based `Client` and `@solana/react`'s `ClientProvider`.
  
  **Breaking changes**
  
  - `@macalinao/gill-extra`: removed `createSolanaClient` and the `SolanaClient`, `CreateSolanaClientArgs`, `SolanaClientUrlOrMoniker`, `LocalnetUrl`, `ModifiedClusterUrl` and `GenericUrl` types. Build the client with `createClient().use(solanaRpcConnection(...))` from `@solana/kit` and `@solana/kit-plugin-rpc` instead.
  - `@macalinao/gill-extra`: `getPublicSolanaRpcUrl` now returns kit's branded cluster URLs (`MainnetUrl`, `DevnetUrl`, `TestnetUrl`), so an RPC built from them is typed for that cluster. `"localnet"`/`"localhost"` still return the plain string `http://127.0.0.1:8899`.
  - `@macalinao/grill`: removed `SolanaProvider`, `SolanaProviderProps` and grill's own client context. Grill now reads the client from `ClientProvider` in `@solana/react`, so the app shares one kit client with `@solana/react`'s hooks. `@solana/react` (`^8.3.0`) is a new peer dependency of `@macalinao/grill`. `@macalinao/grill`'s `@solana/kit` peer range goes from `^8` (the kit 8 requirement for v1 transactions) to `^8.3.0`, the minimum `@solana/react` requires.
  - `@macalinao/react-quarry` and `@macalinao/wallet-adapter-compat`: the `@solana/kit` peer range goes from `^8` to `^8.3.0` as well. Both peer-depend on `@macalinao/grill`, so kit 8.0 to 8.2 could not satisfy them anyway.
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
- c715d97: Add support for Solana v1 transactions, and require `@solana/kit` 8.
  
  - **Breaking:** the `@solana/kit` peer dependency is now `^8` (was `^6 || ^7 || ^8`) in every package. The v1 transaction APIs used here were added in kit 8.
  - `createTransaction` (`@macalinao/gill-extra`) accepts `version: 1`. The compute budget is now set with kit's version-aware setters: legacy and v0 transactions still get Compute Budget instructions placed before your instructions, and v1 transactions get the same values in `message.config`.
  - New `createTransaction` options: `priorityFeeLamports`, the total priority fee in lamports (v1 only), and `loadedAccountsDataSizeLimit` (any version).
  - `createTransaction` now throws on invalid combinations. With version 1, both `computeUnitLimit` and `loadedAccountsDataSizeLimit` are required, because an unset value budgets zero compute units or zero bytes and the transaction would fail. `computeUnitPrice` is rejected for v1 (use `priorityFeeLamports`), and `priorityFeeLamports` is rejected for legacy and v0 (use `computeUnitPrice`). `version: "auto"` still only picks legacy or v0.
  - `BuildTXOptions`, shared by `SendTXOptions` and `SignTXOptions` in `@macalinao/grill`, adds `version` (default `0`, as before), `priorityFeeLamports` and `loadedAccountsDataSizeLimit`. Both `useSendTX` and `useSignTX` build v1 transactions. `lookupTables` is only allowed with version 0. If the options are invalid, the send or sign fails with an error status event rather than leaving the toast on "preparing".
  - `getConfirmedTransaction` requests `maxSupportedTransactionVersion: 1`, so it can fetch v1 transactions.
  - `@macalinao/wallet-adapter-compat` rejects v1 transactions with a clear error, whether they are being sent or only signed. Wallet adapters take `@solana/web3.js` transactions, and web3.js can parse v1 messages but cannot serialize them. Send v1 transactions through a Wallet Standard or kit signer.
  - `@solana-program/compute-budget` is no longer a runtime dependency of `@macalinao/gill-extra`.

### Patch Changes

- Updated dependencies [b944b52]
- Updated dependencies [9901c43]
- Updated dependencies [64d71a5]
- Updated dependencies [c715d97]
  - @macalinao/grill@0.20.0
  - @macalinao/quarry@0.6.0

## 12.0.3

### Patch Changes

- Updated dependencies [b77e2cf]
  - @macalinao/grill@0.19.0
  - @macalinao/quarry@0.5.7

## 12.0.2

### Patch Changes

- Updated dependencies [d7bc09a]
  - @macalinao/grill@0.18.0
  - @macalinao/quarry@0.5.6

## 12.0.1

### Patch Changes

- 8501dce: Update dependencies to their latest versions:
  
  - Move to `@solana/kit` v8. The `@solana/kit` peer range widens to `^6 || ^7 || ^8`, so v7 consumers are unaffected.
  - Migrate the Codama-generated program clients to their new `@solana-programs/*` scope: `@macalinao/clients-quarry` becomes `@solana-programs/quarry`, `@macalinao/clients-token-metadata` becomes `@solana-programs/token-metadata`, and `@macalinao/clients-meteora-damm-v2` becomes `@solana-programs/meteora-damm-v2`. The packages are identical apart from the name, so the generated types and instruction builders `@macalinao/quarry` re-exports are unchanged.
  - Bump the SPL program clients that kit v8 requires: `@solana-program/system` to `^0.14.1`, `@solana-program/address-lookup-table` to `^0.14.1`, `@solana-program/token` to `^0.16.1`, and `@solana/webcrypto-ed25519-polyfill` to `8.2.0`.
  - Bump `@tanstack/react-query` to `^5.102.8`, `zod` to `^4.5.4`, and the React 19 type packages.
- Updated dependencies [8501dce]
- Updated dependencies [307bcc3]
  - @macalinao/grill@0.17.1
  - @macalinao/quarry@0.5.4

## 12.0.0

### Patch Changes

- Updated dependencies [887d62d]
- Updated dependencies [4a8fa03]
  - @macalinao/grill@0.17.0
  - @macalinao/quarry@0.5.3

## 11.0.0

### Patch Changes

- Updated dependencies [2d68f3c]
  - @macalinao/grill@0.16.0
  - @macalinao/quarry@0.5.2

## 10.0.0

### Patch Changes

- Updated dependencies [4abe697]
- Updated dependencies [9abd01b]
  - @macalinao/grill@0.15.0
  - @macalinao/quarry@0.5.1

## 9.0.0

### Minor Changes

- 548a2d6: Add support for `@solana/kit` v7.

  The `@solana/kit` peer dependency range widens from `^6` to `^6 || ^7`, so this is not a
  breaking change — projects still on kit 6 keep working, and projects on kit 7 are now
  supported. Every package is typechecked and tested against both majors.

  The Solana program clients used internally move to their kit-7 releases:

  - `@solana-program/address-lookup-table` `^0.12.1` -> `^0.13.0`
  - `@solana-program/system` `^0.12.2` -> `^0.13.0`
  - `@solana-program/token` `^0.14.0` -> `^0.15.0`

  These declare `@solana/kit: ^7.0.0` as their own peer, so on kit 6 your package manager
  will warn about an unsatisfied peer range for them. Their types are compatible with kit 6
  in the ways Grill uses them, but kit 7 is the recommended target.

  No Grill APIs changed. None of the APIs removed in kit 7 (`ReactiveStreamStore`'s
  construction-time `abortSignal` and auto-connect, `getUnifiedState`,
  `getMinimumBalanceForRentExemption` from `@solana/kit`, `createEmptyClient`) were used
  by these packages.

### Patch Changes

- Updated dependencies [548a2d6]
  - @macalinao/grill@0.14.0
  - @macalinao/quarry@0.5.0

## 8.0.0

### Minor Changes

- 5f9badc: Precompile components and hooks with the React Compiler. The three packages that ship React code now run the compiler as part of their tsdown build, so consumers get the automatic memoization whether or not they run the compiler themselves.

  The compiler is configured with `target: "18"` to match these packages' `react: ^18 || ^19` peer range, so the emitted code imports from the `react-compiler-runtime` polyfill (a new dependency of each package) rather than from `react/compiler-runtime`, which only exists in React 19.

### Patch Changes

- Updated dependencies [5f9badc]
  - @macalinao/grill@0.13.0

## 7.0.1

### Patch Changes

- b009fb2: Upgrade `@macalinao/tsconfig` to v4, which turns on `exactOptionalPropertyTypes` (plus `allowImportingTsExtensions`, `rewriteRelativeImportExtensions` and `moduleDetection: "force"`) in the base config.

  Optional properties on public option bags and DAS API response types are now declared as `?: T | undefined` rather than `?: T`. This matches what the zod schemas actually produce and what callers forwarding an optional value actually pass; it widens the accepted input, so it is not a breaking change for consumers.

  `tsconfig.strict.json` drops `erasableSyntaxOnly`, `noImplicitReturns` and `noUncheckedSideEffectImports`, which the v4 base config now enables on its own.

  `bunfig.toml` exempts `@macalinao/tsconfig` from the 7-day `minimumReleaseAge` soak. It is a first-party package, so the soak buys nothing; the 7-day default still applies to every other dependency.

- Updated dependencies [b009fb2]
  - @macalinao/grill@0.12.1
  - @macalinao/quarry@0.4.4

## 7.0.0

### Patch Changes

- Updated dependencies [3d44354]
  - @macalinao/grill@0.12.0
  - @macalinao/quarry@0.4.3

## 6.0.0

### Patch Changes

- 2a0be1d: Fix correctness issues surfaced by stricter type-aware lint rules.

  - `grill`: `extractErrorLogs` threw a `TypeError` while handling an error whose `context` was `null` (`typeof null === "object"` passed the guard, then `.logs` was read off `null`). It now narrows `context` properly and validates that `logs` really is a `string[]`.
  - `grill`: `createPdaQuery` skipped the PDA computation for any falsy `args`, so a valid falsy seed (`0`, `""`) resolved to `null`. It now only skips when `args` is nullish, matching the `enabled: args !== undefined` guard next to it.
  - `dataloader-es`: `getValidCacheKeyFn` widened the value type to `unknown`, which only typechecked because `CacheMap`'s method shorthand was bivariant. `CacheMap` members are now property signatures (checked contravariantly) and the helper is generic over the value type.
  - `gill-extra`, `grill`: transaction `err` fields are `TransactionError | null`, so they are now compared against `null` instead of tested for truthiness.
  - `das-api`, `wallet-adapter-compat`, `dataloader-es`, `grill`: interface members that are functions are declared as property signatures rather than method shorthand, so their parameters are checked contravariantly.

- 9a97870: Build packages with tsdown instead of tsc. Output stays unbundled ESM (one `.js` + `.d.ts` per source file, with source maps), so the published `exports`, `main` and `types` paths are unchanged. Test files are no longer emitted into `dist/`.
- Updated dependencies [879d444]
- Updated dependencies [2a0be1d]
- Updated dependencies [9a97870]
  - @macalinao/grill@0.11.0
  - @macalinao/quarry@0.4.1

## 5.0.0

### Major Changes

- 3e03157: Upgrade to `@solana/kit` v6 and refresh dependencies.

  **Breaking:** the `@solana/kit` peer dependency now requires `^6`. Consumers must upgrade to `@solana/kit` v6.

  - Bump the `@solana-program/*` clients to their kit-v6 releases (`token` `^0.13`, `system` `^0.12`, `address-lookup-table` `^0.11`, `token-2022` `^0.9`).
  - Bump `@solana/webcrypto-ed25519-polyfill` to `6.9.0` in `@macalinao/wallet-adapter-compat`.
  - Update tooling and shared dependencies (TypeScript 6, Biome 2.4, Turbo 2.9, React 19.2.7, TanStack Query 5.101, and others).

  > Note: `gill@0.14.0` still declares `@solana/kit@^5`. This repo forces a single kit v6 instance via a root `overrides` entry, and the build/tests pass on kit v6. Downstream consumers on kit v6 may need a similar `overrides`/`resolutions` entry for `@solana/kit` until `gill` ships native kit v6 support.

### Patch Changes

- Updated dependencies [3e03157]
  - @macalinao/grill@0.10.0
  - @macalinao/quarry@0.4.0

## 4.0.0

### Patch Changes

- 804b34f: update some dependencies
- Updated dependencies [804b34f]
- Updated dependencies [550b61b]
- Updated dependencies [86e4165]
  - @macalinao/quarry@0.3.2
  - @macalinao/grill@0.9.0

## 3.0.1

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies
- Updated dependencies [74d15f7]
- Updated dependencies [2f832a8]
  - @macalinao/quarry@0.3.1
  - @macalinao/grill@0.8.2

## 3.0.0

### Patch Changes

- Updated dependencies [7aa4e36]
- Updated dependencies [c3b2bf4]
  - @macalinao/quarry@0.3.0
  - @macalinao/grill@0.8.0

## 2.0.0

### Patch Changes

- Updated dependencies [5ebaaa1]
- Updated dependencies [ef7c68e]
  - @macalinao/grill@0.7.0
  - @macalinao/quarry@0.2.5

## 1.0.4

### Patch Changes

- d8f999b: Allow specifying custom loading state for merge miner provider
- ffac787: Bump to Bun 1.3
- Updated dependencies [ffac787]
  - @macalinao/grill@0.6.5

## 1.0.3

### Patch Changes

- f17031d: Fix bun-types import
- 6e1a67b: Fix bug with useGeneratedValue (not aborted)
- Updated dependencies [f17031d]
- Updated dependencies [d3ee6e1]
  - @macalinao/quarry@0.2.4
  - @macalinao/grill@0.6.4

## 1.0.2

### Patch Changes

- fecc82c: Bump dependencies
- Updated dependencies [fecc82c]
  - @macalinao/quarry@0.2.3
  - @macalinao/grill@0.6.3

## 1.0.1

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages
- Updated dependencies [481456c]
  - @macalinao/quarry@0.2.1
  - @macalinao/grill@0.6.1

## 1.0.0

### Minor Changes

- 7300702: Fix bugs around quarry merge miner initialization, more pda hooks

### Patch Changes

- Updated dependencies [7768fe9]
- Updated dependencies [7300702]
  - @macalinao/quarry@0.2.0
  - @macalinao/grill@0.6.0

## 0.1.0

### Minor Changes

- ea6f8a5: rename balance -> blanceRaw, expose mergeMinerAddress

### Patch Changes

- 56571db: Fix peer dep

## 0.0.11

### Patch Changes

- Updated dependencies [d57f739]
  - @macalinao/quarry@0.1.0

## 0.0.10

### Patch Changes

- 42846e7: Dependency bumps
- Updated dependencies [42846e7]
  - @macalinao/quarry@0.0.4
  - @macalinao/grill@0.5.14

## 0.0.9

### Patch Changes

- Updated dependencies [b0a90a2]
  - @macalinao/grill@0.5.13

## 0.0.8

### Patch Changes

- Updated dependencies [b577d51]
  - @macalinao/quarry@0.0.3
  - @macalinao/grill@0.5.12

## 0.0.7

### Patch Changes

- Updated dependencies [48ec0ee]
  - @macalinao/grill@0.5.11

## 0.0.6

### Patch Changes

- @macalinao/grill@0.5.10

## 0.0.5

### Patch Changes

- aef5258: Update all dependencies
- Updated dependencies [aef5258]
  - @macalinao/quarry@0.0.2
  - @macalinao/grill@0.5.9

## 0.0.4

### Patch Changes

- @macalinao/grill@0.5.8

## 0.0.3

### Patch Changes

- Updated dependencies [bf01031]
- Updated dependencies [d6e8cfb]
  - @macalinao/grill@0.5.7

## 0.0.2

### Patch Changes

- d0e677b: Update dependencies, speed up linting
- Updated dependencies [d0e677b]
  - @macalinao/grill@0.5.6

## 0.0.1

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/quarry@0.0.1
  - @macalinao/grill@0.5.5
