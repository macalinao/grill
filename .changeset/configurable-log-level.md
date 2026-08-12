---
"@macalinao/grill": minor
"@macalinao/gill-extra": minor
---

Make console logging configurable so apps built on grill can control (or silence) the library's output.

- `GrillProvider` and `GrillHeadlessProvider` accept a `logLevel` prop: `"off" | "error" | "warn" | "info" | "debug"`, defaulting to `"info"`. Each level enables itself and everything more severe; `"off"` emits no console output at all.
- Every `console.*` call in grill now goes through that level — failed transactions and simulations at `"error"`, background refetch failures at `"warn"`, and the per-event transaction status dump (previously an unconditional `console.log` for anyone without an `onTransactionStatusEvent` handler) at `"debug"`.
- New `useLogger()` hook returns the configured logger, so app-level logging can be silenced by the same prop.
- `@macalinao/gill-extra` exports `createLogger`, `defaultLogger`, `DEFAULT_LOG_LEVEL` and the `LogLevel` / `Logger` types. `logTransactionSimulation`, `fetchTokenInfo`, `fetchTokenInfoForMint` and `pollConfirmTransaction` take an optional `logger`; they keep logging at the default level when none is passed.

Since the default level is `"info"`, existing apps mostly see the same output minus the transaction status firehose. Pass `logLevel="error"` (or `"off"`) to quiet things down in production.
