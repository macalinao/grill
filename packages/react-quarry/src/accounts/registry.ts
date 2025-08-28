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
 * A Registry maintains a list of all Rewarders in the Quarry ecosystem,
 * serving as a central directory for reward programs.
 *
 * @example
 * ```tsx
 * const { data: registry } = useRegistry({
 *   address: registryAddress
 * });
 * ```
 */
export const useRegistry: UseDecodedAccountHook<Registry> =
  createDecodedAccountHook<Registry>(getRegistryDecoder());

/**
 * Hook to fetch and decode multiple Registry accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: registries } = useRegistries({
 *   addresses: [registry1, registry2]
 * });
 * ```
 */
export const useRegistries: UseDecodedAccountsHook<Registry> =
  createDecodedAccountsHook<Registry>(getRegistryDecoder());
