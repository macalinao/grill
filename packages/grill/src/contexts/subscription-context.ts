import type { Account, Address, EncodedAccount, Lamports } from "@solana/kit";
import type { QueryClient } from "@tanstack/react-query";
import type { RpcSubscriptions, SolanaRpcSubscriptionsApi } from "gill";
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
 * Internal subscription entry tracking the WebSocket subscription and reference count.
 */
interface SubscriptionEntry {
  abortController: AbortController;
  refCount: number;
  decoder: AccountDecoder<AccountData>;
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
   */
  subscribe<T extends AccountData>(
    address: Address,
    decoder: AccountDecoder<T>,
  ): () => void;

  /**
   * Get the current reference count for an address (for debugging).
   */
  getSubscriptionCount(address: Address): number;
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
 * Creates a subscription manager instance.
 */
export function createSubscriptionManager(
  rpcSubscriptions: RpcSubscriptionsType,
  queryClient: QueryClient,
): SubscriptionManager {
  const subscriptions = new Map<string, SubscriptionEntry>();

  const setupSubscription = async <T extends AccountData>(
    address: Address,
    decoder: AccountDecoder<T>,
    abortSignal: AbortSignal,
  ): Promise<void> => {
    try {
      const accountNotifications = await rpcSubscriptions
        .accountNotifications(address, {
          commitment: "confirmed",
          encoding: "base64",
        })
        .subscribe({ abortSignal });

      for await (const notification of accountNotifications) {
        try {
          const value =
            notification.value as unknown as AccountNotificationValue;

          // Handle account closure (lamports = 0)
          if (value.lamports === 0n) {
            queryClient.setQueryData(createAccountQueryKey(address), null);
            continue;
          }

          // Parse and decode, then update cache
          const encodedAccount = parseAccountNotification(address, value);
          const decoded = decoder(encodedAccount);
          queryClient.setQueryData(createAccountQueryKey(address), decoded);
        } catch (decodeError) {
          console.error(
            `[SubscriptionManager] Error decoding account ${address}:`,
            decodeError,
          );
        }
      }
    } catch (error) {
      // AbortError is expected when unsubscribing
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error(
        `[SubscriptionManager] Subscription error for ${address}:`,
        error,
      );
    }
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
      return () => {
        existing.refCount--;
        if (existing.refCount === 0) {
          existing.abortController.abort();
          subscriptions.delete(key);
        }
      };
    }

    // Create new subscription
    const abortController = new AbortController();
    const entry: SubscriptionEntry = {
      abortController,
      refCount: 1,
      decoder: decoder as AccountDecoder<AccountData>,
    };
    subscriptions.set(key, entry);

    // Start the WebSocket subscription
    void setupSubscription(address, decoder, abortController.signal);

    // Return unsubscribe function
    return () => {
      const currentEntry = subscriptions.get(key);
      if (!currentEntry) {
        return;
      }

      currentEntry.refCount--;
      if (currentEntry.refCount === 0) {
        currentEntry.abortController.abort();
        subscriptions.delete(key);
      }
    };
  };

  const getSubscriptionCount = (address: Address): number => {
    const entry = subscriptions.get(address);
    return entry?.refCount ?? 0;
  };

  return {
    subscribe,
    getSubscriptionCount,
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
