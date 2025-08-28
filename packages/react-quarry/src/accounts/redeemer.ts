import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Redeemer } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getRedeemerDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Redeemer account.
 * A Redeemer manages the redemption of IOU tokens for actual reward tokens,
 * enabling delayed distribution of rewards.
 *
 * @example
 * ```tsx
 * const { data: redeemer } = useRedeemer({
 *   address: redeemerAddress
 * });
 * ```
 */
export const useRedeemer: UseDecodedAccountHook<Redeemer> =
  createDecodedAccountHook<Redeemer>(getRedeemerDecoder());

/**
 * Hook to fetch and decode multiple Redeemer accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: redeemers } = useRedeemers({
 *   addresses: [redeemer1, redeemer2]
 * });
 * ```
 */
export const useRedeemers: UseDecodedAccountsHook<Redeemer> =
  createDecodedAccountsHook<Redeemer>(getRedeemerDecoder());
