import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Minter } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMinterDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Minter account.
 * A Minter controls the minting of reward tokens for Quarry rewards,
 * managing mint rate and allowances for the rewards distribution.
 *
 * @example
 * ```tsx
 * const { data: minter } = useMinter({
 *   address: minterAddress
 * });
 * ```
 */
export const useMinter: UseDecodedAccountHook<Minter> =
  createDecodedAccountHook<Minter>(getMinterDecoder());

/**
 * Hook to fetch and decode multiple Minter accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: minters } = useMinters({
 *   addresses: [minter1, minter2]
 * });
 * ```
 */
export const useMinters: UseDecodedAccountsHook<Minter> =
  createDecodedAccountsHook<Minter>(getMinterDecoder());
