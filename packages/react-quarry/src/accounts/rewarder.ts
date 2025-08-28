import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Rewarder } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getRewarderDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Rewarder account.
 * A Rewarder manages the distribution of rewards across multiple Quarries.
 */
export const useRewarder: UseDecodedAccountHook<Rewarder> =
  createDecodedAccountHook<Rewarder>(getRewarderDecoder());

export const useRewarders: UseDecodedAccountsHook<Rewarder> =
  createDecodedAccountsHook<Rewarder>(getRewarderDecoder());
