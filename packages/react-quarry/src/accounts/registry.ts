import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getRegistryDecoder, type Registry } from "@macalinao/quarry";

/**
 * Hook to fetch and decode a Registry account.
 * A Registry maintains a list of all Rewarders in the Quarry ecosystem.
 */
export const useRegistry: UseDecodedAccountHook<Registry> =
  createDecodedAccountHook<Registry>(getRegistryDecoder());
