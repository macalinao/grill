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
 * A MintWrapper wraps a token mint with additional permissions and controls,
 * allowing the Quarry protocol to manage minting permissions for reward tokens.
 *
 * @example
 * ```tsx
 * const { data: mintWrapper } = useMintWrapper({
 *   address: mintWrapperAddress
 * });
 * ```
 */
export const useMintWrapper: UseDecodedAccountHook<MintWrapper> =
  createDecodedAccountHook<MintWrapper>(getMintWrapperDecoder());

/**
 * Hook to fetch and decode multiple MintWrapper accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: mintWrappers } = useMintWrappers({
 *   addresses: [wrapper1, wrapper2]
 * });
 * ```
 */
export const useMintWrappers: UseDecodedAccountsHook<MintWrapper> =
  createDecodedAccountsHook<MintWrapper>(getMintWrapperDecoder());
