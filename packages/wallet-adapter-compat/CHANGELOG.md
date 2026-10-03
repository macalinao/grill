# @macalinao/wallet-adapter-compat

## 14.3.0

### Minor Changes

- ebde463: Breaking: require React 19. Compiled hooks now use React's built-in `react/compiler-runtime` instead of the `react-compiler-runtime` polyfill, removing ~6 KB min from bundles.
  
  - The `react` (and, for `wallet-adapter-compat`, `react-dom`) peer range is now `^19` (was `^18 || ^19`).
  - The `react-compiler-runtime` dependency is removed.

### Patch Changes

- Updated dependencies [ebde463]
  - @macalinao/grill@0.21.0

## 14.2.0

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

## 14.1.0

### Minor Changes

- b77e2cf: Add `useSignTX`, which signs a transaction and returns the fully-signed `Transaction` without broadcasting it — for handing a transaction to a backend/relayer, combining it with additional signers, or sending it later. It requires a wallet that supports signing separately from sending; otherwise the returned promise rejects.
  
  - `@macalinao/grill`
    - New `useSignTX` hook, plus `signed` and `error-transaction-sign-failed` transaction status events with matching `GrillProvider` toasts.
    - `useSignTX` builds its signing function itself rather than reading one off `GrillContext`, so the signing code stays out of `GrillProvider`'s import graph. Apps that never import `useSignTX` do not pay for it — bundlers drop it entirely.
    - `GrillContextValue` now also carries the provider's `onTransactionStatusEvent`, `rpcUrl`, and `cluster`, which is what lets hooks build their own transaction functions.
    - The `GrillSigner` type moved from `contexts/wallet-context.ts` to the package's shared `types` module. It is still exported from the package root, so imports from `@macalinao/grill` are unaffected.
  - `@macalinao/gill-extra`: new `BuildTXOptions`, `SignTXOptions`, and `SignTXFunction` types.
  - `@macalinao/wallet-adapter-compat`: the signer created from a wallet adapter is now a composite — always a `TransactionSendingSigner`, and additionally a `TransactionPartialSigner` (exposing `signTransactions`) when the wallet exposes `signTransaction`. It also no longer logs every transaction's wire bytes to the console.

### Patch Changes

- Updated dependencies [b77e2cf]
  - @macalinao/grill@0.19.0

## 14.0.3

### Patch Changes

- Updated dependencies [d7bc09a]
  - @macalinao/grill@0.18.0

## 14.0.2

### Patch Changes

- 7b8d812: Update dependencies:
  
  - `@solana/kit` to `^8.3.0` and `@solana/webcrypto-ed25519-polyfill` to `8.3.0` (`@macalinao/wallet-adapter-compat`). The `@solana/kit` peer range stays `^6 || ^7 || ^8`.
  - `@solana-programs/token-metadata` to `^0.8.0` (`@macalinao/gill-extra`, `@macalinao/grill`) and `@solana-programs/quarry` to `^0.7.0` (`@macalinao/quarry`).
  - `@solana/wallet-adapter-base` to `^0.9.28` and `@solana/wallet-adapter-react` to `^0.15.40` (`@macalinao/wallet-adapter-compat` peer deps), plus `@solana/web3.js` to `^1.99.0` for development.
  - `zod` to `^4.6.5` (`@macalinao/das-api`, `@macalinao/zod-solana`). The `zod` peer range stays `^4`.
  - React 19.3 and its type packages, and build tooling: `tsdown` to `^0.23.0`, `@types/bun` to `^1.4.2`.
- Updated dependencies [7b8d812]
- Updated dependencies [9ef9431]
  - @macalinao/grill@0.17.2

## 14.0.1

### Patch Changes

- 8501dce: Update dependencies to their latest versions:
  
  - Move to `@solana/kit` v8. The `@solana/kit` peer range widens to `^6 || ^7 || ^8`, so v7 consumers are unaffected.
  - Migrate the Codama-generated program clients to their new `@solana-programs/*` scope: `@macalinao/clients-quarry` becomes `@solana-programs/quarry`, `@macalinao/clients-token-metadata` becomes `@solana-programs/token-metadata`, and `@macalinao/clients-meteora-damm-v2` becomes `@solana-programs/meteora-damm-v2`. The packages are identical apart from the name, so the generated types and instruction builders `@macalinao/quarry` re-exports are unchanged.
  - Bump the SPL program clients that kit v8 requires: `@solana-program/system` to `^0.14.1`, `@solana-program/address-lookup-table` to `^0.14.1`, `@solana-program/token` to `^0.16.1`, and `@solana/webcrypto-ed25519-polyfill` to `8.2.0`.
  - Bump `@tanstack/react-query` to `^5.102.8`, `zod` to `^4.5.4`, and the React 19 type packages.
- Updated dependencies [8501dce]
- Updated dependencies [307bcc3]
  - @macalinao/grill@0.17.1

## 14.0.0

### Patch Changes

- 887d62d: Make console logging configurable so apps built on grill can control (or silence) the library's output.

  - `GrillProvider` and `GrillHeadlessProvider` accept a `logLevel` prop: `"off" | "error" | "warn" | "info" | "debug"`, defaulting to `"info"`. Each level enables itself and everything more severe; `"off"` emits no console output at all.
  - Every `console.*` call in grill now goes through that level — failed transactions and simulations at `"error"`, background refetch failures at `"warn"`, and the per-event transaction status dump (previously an unconditional `console.log` for anyone without an `onTransactionStatusEvent` handler) at `"debug"`.
  - New `useLogger()` hook returns the configured logger, so app-level logging can be silenced by the same prop.
  - `@macalinao/wallet-adapter-compat` no longer logs every transaction's base64 wire bytes to the console — that was a leftover debug statement, now removed.
  - `@macalinao/gill-extra` exports `createLogger`, `defaultLogger`, `DEFAULT_LOG_LEVEL` and the `LogLevel` / `Logger` types. `logTransactionSimulation`, `fetchTokenInfo`, `fetchTokenInfoForMint` and `pollConfirmTransaction` take an optional `logger`; they keep logging at the default level when none is passed.

  Since the default level is `"info"`, existing apps mostly see the same output minus the transaction status firehose. Pass `logLevel="error"` (or `"off"`) to quiet things down in production.

- Updated dependencies [887d62d]
- Updated dependencies [4a8fa03]
  - @macalinao/grill@0.17.0

## 13.0.0

### Patch Changes

- Updated dependencies [2d68f3c]
  - @macalinao/grill@0.16.0

## 12.0.0

### Patch Changes

- Updated dependencies [4abe697]
- Updated dependencies [9abd01b]
  - @macalinao/grill@0.15.0

## 11.0.0

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

## 10.0.0

### Minor Changes

- 5f9badc: Precompile components and hooks with the React Compiler. The three packages that ship React code now run the compiler as part of their tsdown build, so consumers get the automatic memoization whether or not they run the compiler themselves.

  The compiler is configured with `target: "18"` to match these packages' `react: ^18 || ^19` peer range, so the emitted code imports from the `react-compiler-runtime` polyfill (a new dependency of each package) rather than from `react/compiler-runtime`, which only exists in React 19.

### Patch Changes

- Updated dependencies [5f9badc]
  - @macalinao/grill@0.13.0

## 9.0.0

### Patch Changes

- Updated dependencies [3d44354]
  - @macalinao/grill@0.12.0

## 8.0.0

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

## 7.0.0

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

## 6.0.0

### Patch Changes

- 804b34f: update some dependencies
- Updated dependencies [804b34f]
- Updated dependencies [550b61b]
- Updated dependencies [86e4165]
  - @macalinao/grill@0.9.0

## 5.0.2

### Patch Changes

- 74d15f7: Update Coda deps
- 2f832a8: Update all dependencies
- Updated dependencies [74d15f7]
- Updated dependencies [2f832a8]
  - @macalinao/grill@0.8.2

## 5.0.1

### Patch Changes

- 44c32ff: Fix wallet adapter compat provider signer useMemo deps

## 5.0.0

### Patch Changes

- Updated dependencies [c3b2bf4]
  - @macalinao/grill@0.8.0

## 4.0.1

### Patch Changes

- 0aa94dc: package bumps
- Updated dependencies [cd3464c]
  - @macalinao/grill@0.7.4

## 4.0.0

### Patch Changes

- Updated dependencies [5ebaaa1]
- Updated dependencies [ef7c68e]
  - @macalinao/grill@0.7.0

## 3.0.3

### Patch Changes

- ffac787: Bump to Bun 1.3
- Updated dependencies [ffac787]
  - @macalinao/grill@0.6.5

## 3.0.2

### Patch Changes

- fecc82c: Bump dependencies
- Updated dependencies [fecc82c]
  - @macalinao/grill@0.6.3

## 3.0.1

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages
- Updated dependencies [481456c]
  - @macalinao/grill@0.6.1

## 3.0.0

### Patch Changes

- Updated dependencies [7300702]
  - @macalinao/grill@0.6.0

## 2.0.14

### Patch Changes

- 42846e7: Dependency bumps
- Updated dependencies [42846e7]
  - @macalinao/grill@0.5.14

## 2.0.13

### Patch Changes

- Updated dependencies [b0a90a2]
  - @macalinao/grill@0.5.13

## 2.0.12

### Patch Changes

- Updated dependencies [b577d51]
  - @macalinao/grill@0.5.12

## 2.0.11

### Patch Changes

- Updated dependencies [48ec0ee]
  - @macalinao/grill@0.5.11

## 2.0.10

### Patch Changes

- @macalinao/grill@0.5.10

## 2.0.9

### Patch Changes

- aef5258: Update all dependencies
- Updated dependencies [aef5258]
  - @macalinao/grill@0.5.9

## 2.0.8

### Patch Changes

- @macalinao/grill@0.5.8

## 2.0.7

### Patch Changes

- Updated dependencies [bf01031]
- Updated dependencies [d6e8cfb]
  - @macalinao/grill@0.5.7

## 2.0.6

### Patch Changes

- d0e677b: Update dependencies, speed up linting
- Updated dependencies [d0e677b]
  - @macalinao/grill@0.5.6

## 2.0.5

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/grill@0.5.5

## 2.0.4

### Patch Changes

- Updated dependencies [67558f1]
  - @macalinao/grill@0.5.4

## 2.0.3

### Patch Changes

- Updated dependencies [1a5e0bd]
- Updated dependencies [aabb7d1]
  - @macalinao/grill@0.5.3

## 2.0.2

### Patch Changes

- @macalinao/grill@0.5.2

## 2.0.1

### Patch Changes

- 57adf4b: README license updates
- Updated dependencies [57adf4b]
- Updated dependencies [04169c9]
- Updated dependencies [e882c7d]
  - @macalinao/grill@0.5.1

## 2.0.0

### Patch Changes

- 9bc5c90: Breaking: Simplify useAccounts return type
- b3c1751: Dependency bumps
- Updated dependencies [9bc5c90]
- Updated dependencies [b3c1751]
  - @macalinao/grill@0.5.0

## 1.0.3

### Patch Changes

- Updated dependencies [28b6a62]
  - @macalinao/grill@0.4.3

## 1.0.2

### Patch Changes

- Updated dependencies [6ca32bc]
  - @macalinao/grill@0.4.2

## 1.0.1

### Patch Changes

- @macalinao/grill@0.4.1

## 1.0.0

### Patch Changes

- Updated dependencies [35a7d46]
  - @macalinao/grill@0.4.0

## 0.2.6

### Patch Changes

- 4e5efaa: Clean up dependencies and peer dependencies
- 2cd4a4b: Move @types/bun into catalog
- Updated dependencies [64b4a18]
- Updated dependencies [4e5efaa]
- Updated dependencies [2cd4a4b]
  - @macalinao/grill@0.3.2

## 0.2.5

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges
- Updated dependencies [c7eb4a2]
  - @macalinao/grill@0.3.1

## 0.2.4

### Patch Changes

- Updated dependencies [49c1d2c]
- Updated dependencies [87c6415]
  - @macalinao/grill@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies [26af4d0]
  - @macalinao/grill@0.2.3

## 0.2.2

### Patch Changes

- 62a5325: Remove debug logs from wallet-adapter-compat
- Updated dependencies [0a3cfb6]
- Updated dependencies [78e247a]
  - @macalinao/grill@0.2.2

## 0.2.1

### Patch Changes

- f450ea4: Re-release for fixed chagneset config
- Updated dependencies [f450ea4]
  - @macalinao/grill@0.2.1

## 0.2.0

### Minor Changes

- 32cc1bb: Force republish

### Patch Changes

- Updated dependencies [32cc1bb]
- Updated dependencies [c85a7ca]
  - @macalinao/grill@0.2.0
