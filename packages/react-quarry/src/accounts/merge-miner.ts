import type { UseDecodedAccountHook } from "@macalinao/grill";
import type { MergeMiner } from "@macalinao/quarry";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getMergeMinerDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a MergeMiner account.
 * A MergeMiner allows staking in multiple Quarries simultaneously using the same tokens.
 */
export const useMergeMiner: UseDecodedAccountHook<MergeMiner> =
  createDecodedAccountHook<MergeMiner>(getMergeMinerDecoder());
