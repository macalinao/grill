import type { Address } from "@solana/kit";
import type {
  AccountData,
  AccountDecoder,
} from "../contexts/subscription-context.js";
import { useEffect, useRef } from "react";
import { useSubscriptionManager } from "../contexts/subscription-context.js";

/**
 * Hook to subscribe to account changes via the SubscriptionManager.
 *
 * This hook:
 * - Uses the SubscriptionManager for de-duplicated WebSocket subscriptions
 * - Only creates one subscription per account address across all components
 * - Automatically cleans up when all subscribers unmount
 * - Updates React Query cache when account data changes
 *
 * @param address - The account address to subscribe to, or null/undefined to skip
 * @param decoder - Function to decode the account data (must be stable reference)
 * @param enabled - Whether the subscription should be active
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const minerPda = useMinerPda({ authority });
 *
 *   // Subscribe to account changes
 *   useAccountSubscription(minerPda, decodeMiner, true);
 *
 *   // Use the standard account hook for data - it gets updated by the subscription
 *   const { data: miner } = useAccount({ address: minerPda, decoder: decodeMiner });
 *
 *   return <div>{miner?.data.authority}</div>;
 * }
 * ```
 */
export function useAccountSubscription<T extends AccountData>(
  address: Address | null | undefined,
  decoder: AccountDecoder<T> | undefined,
  enabled: boolean,
): void {
  const manager = useSubscriptionManager();

  // Use ref to track the current unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Track the current address to detect changes
  const currentAddressRef = useRef<Address | null | undefined>(null);

  useEffect(() => {
    // Skip if not enabled, no address, or no decoder
    if (!(enabled && address && decoder)) {
      // Clean up any existing subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        currentAddressRef.current = null;
      }
      return;
    }

    // If address changed, clean up old subscription first
    if (currentAddressRef.current !== address) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }

    // Subscribe to the new address
    currentAddressRef.current = address;
    unsubscribeRef.current = manager.subscribe(address, decoder);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        currentAddressRef.current = null;
      }
    };
  }, [manager, address, decoder, enabled]);
}
