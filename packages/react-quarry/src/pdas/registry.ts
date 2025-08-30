import type { PdaHook } from "@macalinao/grill";
import type { RegistrySeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
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
export const useRegistryPda: PdaHook<RegistrySeeds, Address> = createPdaHook(
  findRegistryPda,
  "registryPda",
);
