import type { UseDecodedAccountHook } from "@macalinao/grill";
import type { Redeemer } from "@macalinao/quarry";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getRedeemerDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Redeemer account.
 * A Redeemer manages the redemption of IOU tokens for actual reward tokens.
 */
export const useRedeemer: UseDecodedAccountHook<Redeemer> =
  createDecodedAccountHook<Redeemer>(getRedeemerDecoder());
