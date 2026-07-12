import type { Address } from "@solana/kit";
import type {
  AccountData,
  AccountDecoder,
} from "../contexts/subscription-context.js";
import { useEffect, useMemo } from "react";
import { useSubscriptionManager } from "../contexts/subscription-context.js";

/**
 * Hook to subscribe to changes for multiple accounts via the SubscriptionManager.
 *
 * This is the plural counterpart to `useAccountSubscription`. It:
 * - Subscribes each address through the SubscriptionManager (de-duplicated,
 *   reference-counted WebSocket subscriptions shared with any other subscriber)
 * - Writes decoded updates back to the shared account query keys, so plural
 *   reads (`useAccounts` / `useTokenAccounts`) update live
 * - Is stable against fresh array references: it keys its effect on the content
 *   of the address list, so re-renders that pass a new array with the same
 *   addresses do not churn (unsubscribe/resubscribe) the subscriptions
 * - Automatically cleans up when the address set changes or the component unmounts
 *
 * @param addresses - The account addresses to subscribe to (null/undefined entries are skipped)
 * @param decoder - Function to decode the account data (must be a stable reference)
 * @param enabled - Whether the subscriptions should be active
 *
 * @example
 * ```tsx
 * function Balances({ atas }: { atas: Address[] }) {
 *   useAccountsSubscription(atas, decodeTokenAccount, true);
 *   const { data } = useTokenAccounts({ addresses: atas });
 *   // data updates live as any ATA changes on-chain
 * }
 * ```
 */
export function useAccountsSubscription<T extends AccountData>(
  addresses: (Address | null | undefined)[],
  decoder: AccountDecoder<T> | undefined,
  enabled: boolean,
): void {
  const manager = useSubscriptionManager();

  // Content-stable list of addresses. Keying downstream memos/effects on the
  // joined string means a fresh array reference with identical contents does
  // not re-run the subscription effect.
  const addressesKey = useMemo(
    () =>
      addresses.filter((address): address is Address => !!address).join(","),
    [addresses],
  );
  const activeAddresses = useMemo<Address[]>(
    () => (addressesKey ? (addressesKey.split(",") as Address[]) : []),
    [addressesKey],
  );

  useEffect(() => {
    if (!(enabled && decoder) || activeAddresses.length === 0) {
      return;
    }

    const unsubscribes = activeAddresses.map((address) =>
      manager.subscribe(address, decoder),
    );

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }, [manager, activeAddresses, decoder, enabled]);
}
