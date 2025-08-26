import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getMintWrapperDecoder, type MintWrapper } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a MintWrapper account.
 * A MintWrapper wraps a token mint with additional permissions and controls.
 */
export const useMintWrapper: UseDecodedAccountHook<MintWrapper> =
  createDecodedAccountHook<MintWrapper>(getMintWrapperDecoder());
