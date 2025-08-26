import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getMergePoolDecoder  } from "@macalinao/quarry";
import type {MergePool} from "@macalinao/quarry";

/**
 * Hook to fetch and decode a MergePool account.
 * A MergePool manages merge mining operations across multiple Quarries.
 */
export const useMergePool: UseDecodedAccountHook<MergePool> =
  createDecodedAccountHook<MergePool>(getMergePoolDecoder());
