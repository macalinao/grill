import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getMinterDecoder, type Minter } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Minter account.
 * A Minter controls the minting of reward tokens for Quarry rewards.
 */
export const useMinter: UseDecodedAccountHook<Minter> =
  createDecodedAccountHook<Minter>(getMinterDecoder());
