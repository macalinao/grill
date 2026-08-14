---
"@macalinao/gill-extra": minor
"@macalinao/grill": minor
---

Confirm transactions over WebSockets, and stop refetching the confirmed transaction.

- New `confirmTransaction` in `@macalinao/gill-extra` waits for a transaction by subscribing to
  `signatureNotifications`, so confirmation settles as soon as the cluster reports a verdict instead
  of on the next poll tick. A dropped socket is re-opened with exponential backoff, and because
  signature notifications are never replayed, every successful subscribe is paired with a
  `getSignatureStatuses` catch-up check so a transaction that confirmed while nothing was listening
  cannot hang. Blockhash expiry is watched alongside the subscription. Falls back to polling when no
  subscriptions client is given or the subscription cannot be opened.
- `sendTX` now confirms this way whenever the provider has a subscriptions client, and derives the
  accounts to reload from the transaction message it just sent. This removes the `getTransaction`
  round trip that used to follow every confirmation. Pass `fetchTransactionLogs: true` to get the
  old program-log dump back; it is emitted at the `debug` log level.
- `sendTX` accepts a `confirmation` option to tune the poll cadence and attempts, the blockhash
  expiry check interval, and subscription reconnect backoff. These were previously unreachable.
- `pollTransactionConfirmation` is exported for the polling strategy on its own, returning the
  transaction's `{ err }` rather than fetching the full transaction. An on-chain failure now raises
  the real error via `getSolanaErrorFromTransactionError` instead of a generic
  `Error("Transaction failed on-chain")`.
- New `getWritableAccounts` derives the addresses a transaction message writes to (fee payer plus
  every writable instruction account) without an RPC call. Works before or after address lookup
  table compression.
- The subscription reconnect helpers (`getReconnectDelayMs`, `waitBeforeReconnect`,
  `waitForDelay`, `resolveReconnectConfig`, `SubscriptionReconnectConfig`) moved into
  `@macalinao/gill-extra` and are now exported. They also stop waiting out the full backoff when
  handed an already-aborted signal.
