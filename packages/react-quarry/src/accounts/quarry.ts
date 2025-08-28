import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Quarry } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getQuarryDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Quarry account.
 * A Quarry represents a mining pool where users can stake tokens to earn rewards.
 * Each Quarry is associated with a specific token and reward rate.
 *
 * @example
 * ```tsx
 * const { data: quarry } = useQuarry({
 *   address: quarryAddress
 * });
 * ```
 */
export const useQuarry: UseDecodedAccountHook<Quarry> =
  createDecodedAccountHook<Quarry>(getQuarryDecoder());

/**
 * Hook to fetch and decode multiple Quarry accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: quarries } = useQuarries({
 *   addresses: quarryAddresses
 * });
 * ```
 */
export const useQuarries: UseDecodedAccountsHook<Quarry> =
  createDecodedAccountsHook<Quarry>(getQuarryDecoder());
