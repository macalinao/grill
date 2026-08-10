---
"@macalinao/grill": minor
---

Account subscriptions are now resilient to connection loss.

- A subscription whose WebSocket errors out, or whose notification stream is closed by the server, is re-opened automatically with exponential backoff (equal jitter, capped at 30s) for as long as anyone is still subscribed. Previously the stream simply ended and the account silently stopped receiving updates.
- Reconnect waits are cut short by the browser's `online` event, so regaining connectivity or waking from sleep resubscribes immediately instead of sitting out the backoff.
- After a reconnect the account's query is invalidated, since notifications published while the socket was down are unrecoverable.
- `createSubscriptionManager` accepts an optional `{ reconnect: { baseDelayMs, maxDelayMs, stableConnectionMs } }` config to tune the backoff.
- `SubscriptionManager` gained `getSubscriptionStatus(address)`, returning `"connecting" | "connected" | "reconnecting"` for the address (or `undefined` when nothing is subscribed).
- Unsubscribe functions are idempotent: calling one twice no longer drops a reference another subscriber still holds, which could tear down a live subscription.
