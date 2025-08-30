import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Rewarder } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getRewarderDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Rewarder account.
 * A Rewarder manages the distribution of rewards across multiple Quarries.
 *
 * @example
 * ```tsx
 * const { data: rewarder, isLoading } = useRewarder({
 *   address: rewarderAddress
 * });
 * ```
 */
export const useRewarder: UseDecodedAccountHook<Rewarder> =
  createDecodedAccountHook<Rewarder>(getRewarderDecoder());

/**
 * Hook to fetch and decode multiple Rewarder accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: rewarders } = useRewarders({
 *   addresses: [rewarder1, rewarder2, rewarder3]
 * });
 * ```
 */
export const useRewarders: UseDecodedAccountsHook<Rewarder> =
  createDecodedAccountsHook<Rewarder>(getRewarderDecoder());
