import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Registry } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getRegistryDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Registry account.
 * A Registry maintains a list of all Rewarders in the Quarry ecosystem.
 */
export const useRegistry: UseDecodedAccountHook<Registry> =
  createDecodedAccountHook<Registry>(getRegistryDecoder());

export const useRegistries: UseDecodedAccountsHook<Registry> =
  createDecodedAccountsHook<Registry>(getRegistryDecoder());
