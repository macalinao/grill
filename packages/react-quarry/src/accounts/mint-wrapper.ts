import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { MintWrapper } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMintWrapperDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a MintWrapper account.
 * A MintWrapper wraps a token mint with additional permissions and controls.
 */
export const useMintWrapper: UseDecodedAccountHook<MintWrapper> =
  createDecodedAccountHook<MintWrapper>(getMintWrapperDecoder());

export const useMintWrappers: UseDecodedAccountsHook<MintWrapper> =
  createDecodedAccountsHook<MintWrapper>(getMintWrapperDecoder());
