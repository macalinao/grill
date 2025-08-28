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
 * A MergePool manages merge mining operations across multiple Quarries.
 */
export const useMergePool: UseDecodedAccountHook<MergePool> =
  createDecodedAccountHook<MergePool>(getMergePoolDecoder());

export const useMergePools: UseDecodedAccountsHook<MergePool> =
  createDecodedAccountsHook<MergePool>(getMergePoolDecoder());
