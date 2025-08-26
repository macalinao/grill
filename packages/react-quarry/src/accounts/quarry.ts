import type { UseDecodedAccountHook } from "@macalinao/grill";
import type { Quarry } from "@macalinao/quarry";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getQuarryDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Quarry account.
 * A Quarry represents a mining pool where users can stake tokens to earn rewards.
 */
export const useQuarry: UseDecodedAccountHook<Quarry> =
  createDecodedAccountHook<Quarry>(getQuarryDecoder());
