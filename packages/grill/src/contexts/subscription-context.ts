import type { Logger } from "@macalinao/gill-extra";
import type {
  Account,
  Address,
  Decoder,
  EncodedAccount,
  Lamports,
} from "@solana/kit";
import type { QueryClient } from "@tanstack/react-query";
import type { RpcSubscriptions, SolanaRpcSubscriptionsApi } from "gill";
import { defaultLogger } from "@macalinao/gill-extra";
import { getBase64Encoder } from "@solana/kit";
import { createContext, useContext } from "react";
import { createAccountQueryKey } from "../query-keys.js";

/**
 * The data constraint for account types from @solana/kit
 */
export type AccountData = object | Uint8Array;

/**
 * Function type for decoding account data from raw bytes to typed account.
 */
export type AccountDecoder<T extends AccountData> = (
  encodedAccount: EncodedAccount,
) => Account<T>;

/**
 * Adapts a `Decoder<TDecodedData>` to an `AccountDecoder<TDecodedData>` for use
 * with the {@link SubscriptionManager}.
 *
 * The subscription manager hands decoders an `EncodedAccount` (address, lamports,
 * raw `data` bytes, ...), whereas a plain `Decoder` only knows how to decode the
 * `data` byte array. This wraps the plain decoder so it produces a full
 * `Account<TDecodedData>`, mirroring how account reads are decoded.
 *
 * @param decoder - The decoder for the account's `data` byte array, or undefined.
 * @returns An `AccountDecoder`, or undefined if no decoder was provided.
 */
export function createAccountDecoderFromDecoder<
  TDecodedData extends AccountData,
>(
  decoder: Decoder<TDecodedData> | undefined,
): AccountDecoder<TDecodedData> | undefined {
  if (!decoder) {
    return undefined;
  }

  return (encodedAccount: EncodedAccount): Account<TDecodedData> => {
    const decoded = decoder.decode(encodedAccount.data);
    return {
      ...encodedAccount,
      data: decoded,
    };
  };
}

/**
 * Connection state of a single account subscription.
 *
 * - `connecting`: the initial `accountNotifications` subscribe is in flight.
 * - `connected`: notifications are streaming.
 * - `reconnecting`: the stream ended or errored and a retry is scheduled.
 */
export type SubscriptionStatus = "connecting" | "connected" | "reconnecting";

/**
 * Tuning for how a dropped subscription is re-established.
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
 * Options for {@link createSubscriptionManager}.
 */
export interface SubscriptionManagerOptions {
  /**
   * Reconnection tuning. Subscriptions always reconnect; this only controls
   * how aggressively.
   */
  reconnect?: SubscriptionReconnectConfig;
  /**
   * Logger used for decode and connection failures. Defaults to
   * {@link defaultLogger}.
   *
   * `GrillProvider` passes a logger built from its `logLevel` prop.
   */
  logger?: Logger | undefined;
}

const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 30_000;
const DEFAULT_STABLE_CONNECTION_MS = 30_000;

/**
 * Internal subscription entry tracking the WebSocket subscription and reference count.
 */
interface SubscriptionEntry {
  abortController: AbortController;
  refCount: number;
  decoder: AccountDecoder<AccountData>;
  status: SubscriptionStatus;
}

/**
 * RPC subscriptions type from gill's SolanaClient
 */
type RpcSubscriptionsType = RpcSubscriptions<SolanaRpcSubscriptionsApi>;

/**
 * Account notification value from subscriptions.
 * Based on the actual RPC response structure for accountNotifications.
 */
interface AccountNotificationValue {
  lamports: Lamports;
  data: readonly [string, string];
  owner: Address;
  executable: boolean;
  space: bigint;
}

/**
 * Interface for the subscription manager that handles WebSocket subscriptions.
 */
export interface SubscriptionManager {
  /**
   * Subscribe to an account's changes via WebSocket.
   * Returns an unsubscribe function that must be called on cleanup.
   *
   * Multiple calls with the same address will share a single WebSocket subscription.
   * The subscription is automatically cleaned up when all subscribers unsubscribe.
   *
   * The subscription is resilient: if the WebSocket drops or the server closes
   * the stream, it is re-established with exponential backoff until the last
   * subscriber unsubscribes.
   */
  subscribe: <T extends AccountData>(
    address: Address,
    decoder: AccountDecoder<T>,
  ) => () => void;

  /**
   * Get the current reference count for an address (for debugging).
   */
  getSubscriptionCount: (address: Address) => number;

  /**
   * Get the connection state for an address, or `undefined` if nothing is
   * subscribed to it (for debugging).
   */
  getSubscriptionStatus: (address: Address) => SubscriptionStatus | undefined;
}

/**
 * Parse a base64 encoded account notification into an EncodedAccount
 */
function parseAccountNotification(
  address: Address,
  value: AccountNotificationValue,
): EncodedAccount {
  // The data is [base64String, "base64"]
  const base64Data = value.data[0];
  const data = getBase64Encoder().encode(base64Data);

  return {
    address,
    data,
    executable: value.executable,
    lamports: value.lamports,
    programAddress: value.owner,
    space: value.space,
  };
}

/**
 * Backoff delay for the given number of consecutive failures, with equal
 * jitter so that a fleet of subscriptions dropped by one outage does not
 * reconnect in lockstep.
 */
function getReconnectDelayMs(
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
function waitBeforeReconnect(
  delayMs: number,
  abortSignal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve) => {
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
 * Creates a subscription manager instance.
 *
 * Subscriptions created by this manager survive connection loss: when the
 * underlying WebSocket errors out or the server closes the notification
 * stream, the manager reconnects with exponential backoff (waking early on the
 * browser's `online` event) and invalidates the account's query so the updates
 * missed while disconnected are picked up.
 */
export function createSubscriptionManager(
  rpcSubscriptions: RpcSubscriptionsType,
  queryClient: QueryClient,
  options: SubscriptionManagerOptions = {},
): SubscriptionManager {
  const {
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    stableConnectionMs = DEFAULT_STABLE_CONNECTION_MS,
  } = options.reconnect ?? {};
  const logger = options.logger ?? defaultLogger;

  const subscriptions = new Map<string, SubscriptionEntry>();

  const applyNotification = (
    address: Address,
    decoder: AccountDecoder<AccountData>,
    value: AccountNotificationValue,
  ): void => {
    try {
      // Handle account closure (lamports = 0)
      if (value.lamports === 0n) {
        queryClient.setQueryData(createAccountQueryKey(address), null);
        return;
      }

      // Parse and decode, then update cache
      const encodedAccount = parseAccountNotification(address, value);
      const decoded = decoder(encodedAccount);
      queryClient.setQueryData(createAccountQueryKey(address), decoded);
    } catch (decodeError) {
      logger.error(
        `[SubscriptionManager] Error decoding account ${address}:`,
        decodeError,
      );
    }
  };

  /**
   * Keeps an account subscription open for as long as anyone is subscribed.
   *
   * Each iteration of the loop opens one WebSocket subscription and drains it.
   * The loop only exits when the entry's `AbortController` fires, which
   * happens when the last subscriber unsubscribes -- every other exit path
   * (server closing the stream, socket error, failed subscribe) is a
   * reconnect.
   */
  const runSubscription = async (
    address: Address,
    entry: SubscriptionEntry,
    abortSignal: AbortSignal,
  ): Promise<void> => {
    let failedAttempts = 0;
    let hasConnected = false;

    // `AbortSignal.aborted` is a readonly property, so TypeScript narrows it to
    // `false` for the rest of the loop body once the `while` condition has been
    // checked. Reading it through a call keeps every later check meaningful.
    const isAborted = (): boolean => abortSignal.aborted;

    while (!isAborted()) {
      let connectedAt: number | null = null;

      try {
        const accountNotifications = await rpcSubscriptions
          .accountNotifications(address, {
            commitment: "confirmed",
            encoding: "base64",
          })
          .subscribe({ abortSignal });

        entry.status = "connected";
        connectedAt = Date.now();

        // Notifications sent while the socket was down are gone for good, so
        // the cached account cannot be trusted after a reconnect. Refetch it.
        if (hasConnected) {
          void queryClient.invalidateQueries({
            queryKey: createAccountQueryKey(address),
          });
        }
        hasConnected = true;

        for await (const notification of accountNotifications) {
          applyNotification(address, entry.decoder, notification.value);
        }

        // Draining the iterator to completion means the server closed the
        // notification stream on us.
      } catch (error) {
        // AbortError is expected when unsubscribing.
        if (isAborted()) {
          return;
        }
        logger.error(
          `[SubscriptionManager] Subscription error for ${address}, reconnecting:`,
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

      entry.status = "reconnecting";
      await waitBeforeReconnect(
        getReconnectDelayMs(failedAttempts, baseDelayMs, maxDelayMs),
        abortSignal,
      );
      failedAttempts++;

      if (isAborted()) {
        return;
      }
      entry.status = "connecting";
    }
  };

  const createUnsubscribe = (
    key: string,
    entry: SubscriptionEntry,
  ): (() => void) => {
    // Unsubscribing twice must not drop the reference count twice, otherwise a
    // subscription that other components still depend on gets torn down.
    let released = false;

    return () => {
      if (released) {
        return;
      }
      released = true;

      entry.refCount--;
      if (entry.refCount <= 0) {
        entry.abortController.abort();
        // Only clear the slot if it still holds this entry -- a later
        // subscribe may already have installed a replacement.
        if (subscriptions.get(key) === entry) {
          subscriptions.delete(key);
        }
      }
    };
  };

  const subscribe = <T extends AccountData>(
    address: Address,
    decoder: AccountDecoder<T>,
  ): (() => void) => {
    const key = address;
    const existing = subscriptions.get(key);

    if (existing) {
      // Increment reference count for existing subscription
      existing.refCount++;
      return createUnsubscribe(key, existing);
    }

    // Create new subscription
    const abortController = new AbortController();
    const entry: SubscriptionEntry = {
      abortController,
      refCount: 1,
      decoder,
      status: "connecting",
    };
    subscriptions.set(key, entry);

    // Start the WebSocket subscription. The loop reconnects on its own; only a
    // bug in the manager itself can reject here.
    void runSubscription(address, entry, abortController.signal).catch(
      (error: unknown) => {
        logger.error(
          `[SubscriptionManager] Subscription loop for ${address} stopped:`,
          error,
        );
      },
    );

    return createUnsubscribe(key, entry);
  };

  const getSubscriptionCount = (address: Address): number => {
    const entry = subscriptions.get(address);
    return entry?.refCount ?? 0;
  };

  const getSubscriptionStatus = (
    address: Address,
  ): SubscriptionStatus | undefined => subscriptions.get(address)?.status;

  return {
    subscribe,
    getSubscriptionCount,
    getSubscriptionStatus,
  };
}

/**
 * React context for subscription manager.
 */
export const SubscriptionContext: React.Context<SubscriptionManager | null> =
  createContext<SubscriptionManager | null>(null);

/**
 * Hook to access the subscription manager.
 * Must be used within a provider that sets up SubscriptionContext.
 *
 * @throws Error if used outside of a provider with SubscriptionContext
 */
export function useSubscriptionManager(): SubscriptionManager {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionManager must be used within a GrillProvider with subscriptions enabled",
    );
  }
  return context;
}
