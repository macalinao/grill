import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { MergeMiner } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMergeMinerDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a MergeMiner account.
 * A MergeMiner allows staking in multiple Quarries simultaneously using the same tokens.
 * This enables users to earn rewards from multiple reward programs without unstaking.
 *
 * @example
 * ```tsx
 * const { data: mergeMiner } = useMergeMiner({
 *   address: mergeMinerAddress
 * });
 * ```
 */
export const useMergeMiner: UseDecodedAccountHook<MergeMiner> =
  createDecodedAccountHook<MergeMiner>(getMergeMinerDecoder());

/**
 * Hook to fetch and decode multiple MergeMiner accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: mergeMiners } = useMergeMiners({
 *   addresses: [mergeMiner1, mergeMiner2]
 * });
 * ```
 */
export const useMergeMiners: UseDecodedAccountsHook<MergeMiner> =
  createDecodedAccountsHook<MergeMiner>(getMergeMinerDecoder());
