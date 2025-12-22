---
"@macalinao/grill": minor
---

Add WebSocket subscription support for real-time account updates

This release adds a subscription system that allows React components to receive real-time account updates via WebSocket connections. Key features:

- **`subscribeToUpdates` option**: Pass `{ subscribeToUpdates: true }` to `useAccount` or hooks created with `createDecodedAccountHook` to enable real-time updates
- **Reference-counted subscriptions**: Multiple components subscribing to the same account share a single WebSocket connection
- **Automatic cache updates**: When an account changes on-chain, the React Query cache is automatically updated
- **Automatic cleanup**: Subscriptions are cleaned up when all subscribers unmount

Example usage:

```tsx
// Subscribe to real-time updates for an account
const { account } = useAccount({
  address: myAddress,
  decoder: myDecoder,
  subscribeToUpdates: true,
});

// Or with a typed account hook
const useMyAccount = createDecodedAccountHook(myDecoder);
const { account } = useMyAccount({
  address: myAddress,
  subscribeToUpdates: true,
});
```

The `SubscriptionProvider` is now automatically included in `GrillHeadlessProvider` and `GrillProvider`, so no additional setup is required.
