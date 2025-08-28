import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Miner } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMinerDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Miner account.
 * A Miner represents a user's staking position in a Quarry,
 * tracking staked balance and accumulated rewards.
 *
 * @example
 * ```tsx
 * const { data: miner } = useMiner({
 *   address: minerAddress
 * });
 * ```
 */
export const useMiner: UseDecodedAccountHook<Miner> =
  createDecodedAccountHook<Miner>(getMinerDecoder());

/**
 * Hook to fetch and decode multiple Miner accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: miners } = useMiners({
 *   addresses: minerAddresses
 * });
 * ```
 */
export const useMiners: UseDecodedAccountsHook<Miner> =
  createDecodedAccountsHook<Miner>(getMinerDecoder());
