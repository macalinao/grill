import type {
  RpcSubscriptions,
  Signature,
  SignatureNotificationsApi,
} from "@solana/kit";
import type { Logger } from "./logger.js";
import type {
  ConfirmationRpc,
  TransactionConfirmation,
} from "./poll-transaction-confirmation.js";
import type { SubscriptionReconnectConfig } from "./reconnect.js";
import { defaultLogger } from "./logger.js";
import {
  getTransactionConfirmation,
  isBlockhashExpired,
  pollTransactionConfirmation,
  TRANSACTION_EXPIRED_MESSAGE,
} from "./poll-transaction-confirmation.js";
import {
  getReconnectDelayMs,
  resolveReconnectConfig,
  waitBeforeReconnect,
  waitForDelay,
} from "./reconnect.js";

/**
 * The subscriptions client `confirmTransaction` needs. `SolanaClient["rpcSubscriptions"]`
 * satisfies it.
 */
export type ConfirmationRpcSubscriptions =
  RpcSubscriptions<SignatureNotificationsApi>;

/**
 * How long to wait between block height checks while a signature subscription
 * is open. The subscription is the primary signal, so this only exists to
 * notice that the blockhash died -- a slower cadence than polling is fine.
 */
export const DEFAULT_BLOCK_HEIGHT_INTERVAL_MS = 5000;

/**
 * How many consecutive failures to open the signature subscription are
 * tolerated before giving up on WebSockets and polling instead.
 */
export const DEFAULT_MAX_SUBSCRIBE_ATTEMPTS = 3;

/**
 * Knobs for how a transaction is confirmed. Every field has a sensible default.
 */
export interface TransactionConfirmationTuning {
  /**
   * How many status checks the polling path makes before giving up.
   *
   * @default 30
   */
  maxRetries?: number | undefined;
  /**
   * How long the polling path waits between status checks, in milliseconds.
   *
   * @default 1000
   */
  retryInterval?: number | undefined;
  /**
   * How often the WebSocket path re-checks the block height to notice an
   * expired blockhash, in milliseconds.
   *
   * @default 5000
   */
  blockHeightIntervalMs?: number | undefined;
  /**
   * How many consecutive failures to open the signature subscription are
   * tolerated before falling back to polling.
   *
   * @default 3
   */
  maxSubscribeAttempts?: number | undefined;
  /**
   * Reconnection tuning for the signature subscription.
   */
  reconnect?: SubscriptionReconnectConfig | undefined;
}

export interface ConfirmTransactionOptions extends TransactionConfirmationTuning {
  signature: Signature;
  /**
   * The last block height at which the transaction's blockhash is still valid.
   * Past it, the transaction can never land and confirmation gives up.
   */
  lastValidBlockHeight: bigint;
  rpc: ConfirmationRpc;
  /**
   * WebSocket subscriptions client. When present, confirmation settles on a
   * `signatureNotifications` notification instead of polling. When absent,
   * confirmation polls.
   */
  rpcSubscriptions?: ConfirmationRpcSubscriptions | undefined;
  /**
   * Aborts confirmation, tearing down the subscription and any pending timers.
   * The returned promise rejects with the signal's reason.
   */
  abortSignal?: AbortSignal | undefined;
  /**
   * Logger used for connection and status check failures. Defaults to
   * {@link defaultLogger}.
   */
  logger?: Logger | undefined;
}

/**
 * Either the confirmation, or a signal that the WebSocket path cannot be used
 * and the caller should poll.
 */
type SubscriptionOutcome =
  | { type: "confirmation"; confirmation: TransactionConfirmation }
  | { type: "unavailable"; cause: unknown };

/**
 * Failures that will not fix themselves on a retry: the endpoint does not
 * speak `signatureSubscribe`, or the client we were handed is not a
 * subscriptions client at all.
 */
const NON_TRANSIENT_SUBSCRIBE_PATTERNS: RegExp[] = [
  /method not found/i,
  /not supported/i,
  /unsupported/i,
  /-32601/,
];

/**
 * Anything can be thrown, but a rejection reason should be an `Error`. Keeps
 * the original as `cause` when it is not one.
 */
function toError(value: unknown): Error {
  return value instanceof Error
    ? value
    : new Error("Transaction confirmation failed", { cause: value });
}

function isNonTransientSubscribeError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
  return NON_TRANSIENT_SUBSCRIBE_PATTERNS.some((pattern) =>
    pattern.test(message),
  );
}

/**
 * Waits for the transaction to be confirmed.
 *
 * When `rpcSubscriptions` is provided, this opens a `signatureNotifications`
 * subscription and settles the moment the cluster reports a verdict, rather
 * than paying a full poll interval of latency. The subscription survives
 * connection loss: a dropped socket is re-opened with exponential backoff until
 * the transaction is confirmed, its blockhash expires, or the caller aborts.
 *
 * `signatureNotifications` deliberately never replays events that already
 * happened, so a transaction that confirmed between being sent and the
 * subscription being established -- or during a reconnect window -- would never
 * produce a notification. Every successful subscribe is therefore followed
 * immediately by a `getSignatureStatuses` catch-up check, so confirmation can
 * never hang on a notification that is not coming.
 *
 * Blockhash expiry is watched independently of the subscription, on a slower
 * cadence than polling uses.
 *
 * Falls back to `pollTransactionConfirmation` when no subscriptions client is
 * given, or when the subscription cannot be established.
 *
 * @returns The transaction's confirmation, including its on-chain error if it
 *   failed. Landing with an error is not an exception here -- inspect `err`,
 *   and pass it to `getSolanaErrorFromTransactionError` to raise it.
 * @throws If the blockhash expires, confirmation is aborted, or the fallback
 *   poll times out.
 */
export async function confirmTransaction({
  signature,
  lastValidBlockHeight,
  rpc,
  rpcSubscriptions,
  abortSignal,
  logger = defaultLogger,
  maxRetries,
  retryInterval,
  blockHeightIntervalMs = DEFAULT_BLOCK_HEIGHT_INTERVAL_MS,
  maxSubscribeAttempts = DEFAULT_MAX_SUBSCRIBE_ATTEMPTS,
  reconnect,
}: ConfirmTransactionOptions): Promise<TransactionConfirmation> {
  abortSignal?.throwIfAborted();

  const poll = (): Promise<TransactionConfirmation> =>
    pollTransactionConfirmation({
      signature,
      lastValidBlockHeight,
      rpc,
      maxRetries,
      retryInterval,
      abortSignal,
      logger,
    });

  if (!rpcSubscriptions) {
    return poll();
  }

  const outcome = await confirmUsingSubscription({
    signature,
    lastValidBlockHeight,
    rpc,
    rpcSubscriptions,
    abortSignal,
    logger,
    blockHeightIntervalMs,
    maxSubscribeAttempts,
    reconnect,
  });

  if (outcome.type === "confirmation") {
    return outcome.confirmation;
  }

  logger.warn(
    `[confirmTransaction] Could not subscribe to ${signature}, falling back to polling:`,
    outcome.cause,
  );
  return poll();
}

interface ConfirmUsingSubscriptionOptions {
  signature: Signature;
  lastValidBlockHeight: bigint;
  rpc: ConfirmationRpc;
  rpcSubscriptions: ConfirmationRpcSubscriptions;
  abortSignal: AbortSignal | undefined;
  logger: Logger;
  blockHeightIntervalMs: number;
  maxSubscribeAttempts: number;
  reconnect: SubscriptionReconnectConfig | undefined;
}

/**
 * Runs the signature subscription and the blockhash expiry watch side by side,
 * settling on whichever finishes first and tearing the other one down.
 */
async function confirmUsingSubscription({
  signature,
  lastValidBlockHeight,
  rpc,
  rpcSubscriptions,
  abortSignal,
  logger,
  blockHeightIntervalMs,
  maxSubscribeAttempts,
  reconnect,
}: ConfirmUsingSubscriptionOptions): Promise<SubscriptionOutcome> {
  const { baseDelayMs, maxDelayMs, stableConnectionMs } =
    resolveReconnectConfig(reconnect);

  // Everything below hangs off this controller, so settling the outcome tears
  // down the subscription, the expiry watch, and any pending timer at once.
  const controller = new AbortController();
  const isAborted = (): boolean => controller.signal.aborted;

  let settle: (outcome: SubscriptionOutcome) => void = () => undefined;
  let fail: (error: unknown) => void = () => undefined;
  let done = false;
  const outcome = new Promise<SubscriptionOutcome>((resolve, reject) => {
    settle = (value) => {
      if (!done) {
        done = true;
        resolve(value);
      }
    };
    fail = (error) => {
      if (!done) {
        done = true;
        reject(toError(error));
      }
    };
  });

  const onCallerAbort = (): void => {
    fail(abortSignal?.reason ?? new Error("Transaction confirmation aborted"));
  };
  abortSignal?.addEventListener("abort", onCallerAbort, { once: true });

  /**
   * Keeps a signature subscription open until the cluster reports a verdict.
   *
   * Each iteration opens one subscription and drains it. Because notifications
   * are never replayed, every fresh subscription is paired with a status check
   * that catches a transaction which confirmed while nothing was listening.
   */
  const runSubscription = async (): Promise<void> => {
    let failedAttempts = 0;
    let consecutiveSubscribeFailures = 0;

    while (!isAborted()) {
      let connectedAt: number | null = null;

      try {
        const notifications = await rpcSubscriptions
          .signatureNotifications(signature, { commitment: "confirmed" })
          .subscribe({ abortSignal: controller.signal });

        connectedAt = Date.now();
        consecutiveSubscribeFailures = 0;

        // The transaction may have confirmed in the gap before this
        // subscription existed. Nothing will ever notify us about that, so ask.
        const caughtUp = await getTransactionConfirmation(rpc, signature);
        if (caughtUp) {
          settle({ type: "confirmation", confirmation: caughtUp });
          return;
        }

        for await (const notification of notifications) {
          settle({
            type: "confirmation",
            confirmation: { err: notification.value.err },
          });
          return;
        }

        // Draining the iterator to completion means the server closed the
        // notification stream on us.
      } catch (error) {
        if (isAborted()) {
          return;
        }

        if (connectedAt === null) {
          consecutiveSubscribeFailures++;
          // An endpoint that cannot open the subscription at all is not worth
          // waiting on; the caller polls instead.
          if (
            isNonTransientSubscribeError(error) ||
            consecutiveSubscribeFailures >= maxSubscribeAttempts
          ) {
            settle({ type: "unavailable", cause: error });
            return;
          }
        }

        logger.warn(
          `[confirmTransaction] Signature subscription for ${signature} dropped, reconnecting:`,
          error,
        );
      }

      if (isAborted()) {
        return;
      }

      // A connection that stayed up for a while was healthy; do not punish the
      // reconnect with backoff accumulated from an unrelated earlier outage.
      if (
        connectedAt !== null &&
        Date.now() - connectedAt >= stableConnectionMs
      ) {
        failedAttempts = 0;
      }

      await waitBeforeReconnect(
        getReconnectDelayMs(failedAttempts, baseDelayMs, maxDelayMs),
        controller.signal,
      );
      failedAttempts++;
    }
  };

  /**
   * The subscription alone cannot tell us that the blockhash died, so the
   * block height is checked on its own cadence.
   */
  const runExpiryWatch = async (): Promise<void> => {
    while (!isAborted()) {
      await waitForDelay(blockHeightIntervalMs, controller.signal);
      if (isAborted()) {
        return;
      }

      try {
        if (!(await isBlockhashExpired(rpc, lastValidBlockHeight))) {
          continue;
        }

        // The transaction may have landed in the same block that expired the
        // blockhash. Give it one last chance before calling it dead.
        const lastChance = await getTransactionConfirmation(rpc, signature);
        if (lastChance) {
          settle({ type: "confirmation", confirmation: lastChance });
          return;
        }

        fail(new Error(TRANSACTION_EXPIRED_MESSAGE));
        return;
      } catch (error) {
        if (isAborted()) {
          return;
        }
        // A failed height check is not proof of expiry. Try again next tick.
        logger.warn(
          `[confirmTransaction] Block height check for ${signature} failed:`,
          error,
        );
      }
    }
  };

  void runSubscription().catch(fail);
  void runExpiryWatch().catch(fail);

  try {
    return await outcome;
  } finally {
    controller.abort();
    abortSignal?.removeEventListener("abort", onCallerAbort);
  }
}
