import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getMinerDecoder, type Miner } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Miner account.
 * A Miner represents a user's staking position in a Quarry.
 */
export const useMiner: UseDecodedAccountHook<Miner> =
  createDecodedAccountHook<Miner>(getMinerDecoder());
