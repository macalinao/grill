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
 * A Minter controls the minting of reward tokens for Quarry rewards.
 */
export const useMinter: UseDecodedAccountHook<Minter> =
  createDecodedAccountHook<Minter>(getMinterDecoder());

export const useMinters: UseDecodedAccountsHook<Minter> =
  createDecodedAccountsHook<Minter>(getMinterDecoder());
