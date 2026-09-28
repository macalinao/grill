---
"@macalinao/grill": minor
"@macalinao/react-quarry": minor
"@macalinao/wallet-adapter-compat": minor
---

The connected wallet's signer now lives on the @solana/kit client as its `payer` and `identity` (the capabilities from `@solana/plugin-interfaces`) instead of in a grill React context.

- `@macalinao/grill`: add `reactiveSigner()`, a kit plugin that installs a mutable signer as `client.payer` / `client.identity` with `subscribeToPayer` / `subscribeToIdentity` (so `usePayer` / `useIdentity` from `@solana/react` re-render) and a `client.setSigner(signer | null)` method. Add `useWalletSigner()`, which returns the client's payer (or `null`), and reimplement `useConnectedWallet()` on it. `useSendTX` / `useSignTX` use the same signer. **Breaking:** `WalletProvider`, `WalletProviderProps`, `WalletContext`, `WalletContextState` and `useKitWallet` are removed.
- `@macalinao/wallet-adapter-compat`: `WalletAdapterCompatProvider` now writes the wallet-adapter signer to the client with `client.setSigner(...)` instead of rendering grill's `WalletProvider`. **Breaking:** it must be rendered inside `@solana/react`'s `ClientProvider`, whose client has `reactiveSigner()` installed. `@solana/react` is now a peer dependency.
- `@macalinao/react-quarry`: read the wallet with `useWalletSigner()`.

Migration:

```tsx
const client = createClient()
  .use(solanaRpcConnection({ rpcUrl }))
  .use(reactiveSigner()); // new

// Move WalletAdapterCompatProvider inside ClientProvider:
<ClientProvider client={client}>
  <WalletAdapterCompatProvider>
    <GrillProvider>...</GrillProvider>
  </WalletAdapterCompatProvider>
</ClientProvider>;

// const { signer } = useKitWallet();
const signer = useWalletSigner();
```

Any plugin that sets a reactive `payer` that can send transactions (for example `walletSigner()` from `@solana/kit-plugin-wallet`) also works in place of `reactiveSigner()` + `WalletAdapterCompatProvider`.
