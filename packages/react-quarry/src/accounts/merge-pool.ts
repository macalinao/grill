import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { MergePool } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMergePoolDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a MergePool account.
 * A MergePool manages merge mining operations across multiple Quarries,
 * coordinating primary and replica rewards for staked tokens.
 *
 * @example
 * ```tsx
 * const { data: mergePool } = useMergePool({
 *   address: mergePoolAddress
 * });
 * ```
 */
export const useMergePool: UseDecodedAccountHook<MergePool> =
  createDecodedAccountHook<MergePool>(getMergePoolDecoder());

/**
 * Hook to fetch and decode multiple MergePool accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: mergePools } = useMergePools({
 *   addresses: [pool1, pool2, pool3]
 * });
 * ```
 */
export const useMergePools: UseDecodedAccountsHook<MergePool> =
  createDecodedAccountsHook<MergePool>(getMergePoolDecoder());
