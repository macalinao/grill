---
"@macalinao/grill": minor
---

Add real-time subscription support to the plural account hooks. `useAccounts` and `useTokenAccounts` (and any hook built with `createDecodedAccountsHook`) now accept `subscribeToUpdates`, mirroring the singular `useAccount`/`useTokenAccount`.

- New `useAccountsSubscription(addresses, decoder, enabled)` hook — the plural counterpart to `useAccountSubscription`, stable against fresh array references.
- Export `createAccountDecoderFromDecoder`, the `Decoder` → `AccountDecoder` adapter previously private to `useAccount`, so consumers of the raw `SubscriptionManager` no longer need to hand-write it.
