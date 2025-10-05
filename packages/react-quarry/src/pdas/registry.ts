import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { RegistrySeeds } from "@macalinao/quarry";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findRegistryPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Registry.
 * Computes the deterministic address for a Registry account
 * based on the realm address.
 *
 * @param seeds - The seeds for deriving the Registry PDA
 * @param seeds.realm - The realm address for the registry
 * @returns The computed Registry PDA address
 *
 * @example
 * ```tsx
 * const registryPda = useRegistryPda({
 *   realm: realmAddress
 * });
 * ```
 */
export const useRegistryPda: PdaHook<RegistrySeeds> = createPdaHook(
  findRegistryPda,
  "registryPda",
);

/**
 * Hook to derive multiple PDA addresses for Registries.
 * Computes deterministic addresses for multiple Registry accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Registry PDAs
 * @returns Array of computed Registry PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const registryPdas = useRegistryPdas([
 *   { realm: realmAddress1 },
 *   { realm: realmAddress2 }
 * ]);
 * ```
 */
export const useRegistryPdas: PdasHook<RegistrySeeds> = createPdasHook(
  findRegistryPda,
  "registryPda",
);
