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
 */
export const useMergeMiner: UseDecodedAccountHook<MergeMiner> =
  createDecodedAccountHook<MergeMiner>(getMergeMinerDecoder());

export const useMergeMiners: UseDecodedAccountsHook<MergeMiner> =
  createDecodedAccountsHook<MergeMiner>(getMergeMinerDecoder());
