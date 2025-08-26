import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getRewarderDecoder  } from "@macalinao/quarry";
import type {Rewarder} from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Rewarder account.
 * A Rewarder manages the distribution of rewards across multiple Quarries.
 */
export const useRewarder: UseDecodedAccountHook<Rewarder> =
  createDecodedAccountHook<Rewarder>(getRewarderDecoder());
