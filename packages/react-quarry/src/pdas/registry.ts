import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findRegistryPda  } from "@macalinao/quarry";
import type {RegistrySeeds} from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Registry.
 */
export const useRegistryPda: PdaHook<RegistrySeeds, Address> = createPdaHook(
  findRegistryPda,
  "registryPda",
);
