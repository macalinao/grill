/**
 * Tuning for how a dropped WebSocket subscription is re-established.
 */
export interface SubscriptionReconnectConfig {
  /**
   * Delay before the first reconnect attempt, in milliseconds. Doubles on each
   * consecutive failure, up to {@link maxDelayMs}.
   *
   * @default 500
   */
  baseDelayMs?: number;
  /**
   * Upper bound on the delay between reconnect attempts, in milliseconds.
   *
   * @default 30000
   */
  maxDelayMs?: number;
  /**
   * How long a connection must survive before it is considered healthy, in
   * milliseconds. Dropping after this long resets the backoff, so an
   * occasional disconnect reconnects promptly instead of inheriting the delay
   * from an unrelated outage hours earlier.
   *
   * @default 30000
   */
  stableConnectionMs?: number;
}

/**
 * Delay before the first reconnect attempt when none is configured.
 */
export const DEFAULT_RECONNECT_BASE_DELAY_MS = 500;

/**
 * Upper bound on the reconnect delay when none is configured.
 */
export const DEFAULT_RECONNECT_MAX_DELAY_MS = 30_000;

/**
 * How long a connection must survive to reset the backoff, when not configured.
 */
export const DEFAULT_STABLE_CONNECTION_MS = 30_000;

/**
 * A {@link SubscriptionReconnectConfig} with every field filled in.
 */
export interface ResolvedSubscriptionReconnectConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  stableConnectionMs: number;
}

/**
 * Fills in the defaults for a {@link SubscriptionReconnectConfig}.
 */
export function resolveReconnectConfig(
  config: SubscriptionReconnectConfig | undefined,
): ResolvedSubscriptionReconnectConfig {
  const {
    baseDelayMs = DEFAULT_RECONNECT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_RECONNECT_MAX_DELAY_MS,
    stableConnectionMs = DEFAULT_STABLE_CONNECTION_MS,
  } = config ?? {};
  return { baseDelayMs, maxDelayMs, stableConnectionMs };
}

/**
 * Backoff delay for the given number of consecutive failures, with equal
 * jitter so that a fleet of subscriptions dropped by one outage does not
 * reconnect in lockstep.
 */
export function getReconnectDelayMs(
  failedAttempts: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  const exponential = Math.min(
    maxDelayMs,
    baseDelayMs * 2 ** Math.min(failedAttempts, 30),
  );
  return exponential / 2 + Math.random() * (exponential / 2);
}

/**
 * Waits `delayMs` before the next reconnect attempt, resolving early when the
 * subscription is torn down or when the browser reports the network coming
 * back. Waking from sleep or regaining connectivity should not have to sit out
 * the remainder of a 30 second backoff.
 */
export function waitBeforeReconnect(
  delayMs: number,
  abortSignal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve) => {
    // An already-aborted signal never fires `abort`, so waiting on the listener
    // would sit out the whole delay for a teardown that has already happened.
    if (abortSignal.aborted) {
      resolve();
      return;
    }

    const canListenForOnline =
      typeof globalThis.addEventListener === "function";

    let settled = false;
    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      abortSignal.removeEventListener("abort", finish);
      if (canListenForOnline) {
        globalThis.removeEventListener("online", finish);
      }
      resolve();
    };

    const timeout = setTimeout(finish, delayMs);
    abortSignal.addEventListener("abort", finish, { once: true });
    if (canListenForOnline) {
      globalThis.addEventListener("online", finish);
    }
  });
}

/**
 * Waits `delayMs`, resolving early if `abortSignal` fires. Unlike
 * {@link waitBeforeReconnect} this does not wake on the browser's `online`
 * event -- it is for cadences that should keep their period regardless of
 * connectivity changes.
 */
export function waitForDelay(
  delayMs: number,
  abortSignal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve) => {
    if (abortSignal.aborted) {
      resolve();
      return;
    }

    let settled = false;
    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      abortSignal.removeEventListener("abort", finish);
      resolve();
    };

    const timeout = setTimeout(finish, delayMs);
    abortSignal.addEventListener("abort", finish, { once: true });
  });
}
