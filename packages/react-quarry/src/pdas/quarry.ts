import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findQuarryPda, type QuarrySeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Quarry.
 */
export const useQuarryPda: PdaHook<QuarrySeeds, Address> = createPdaHook(
  findQuarryPda,
  "quarryPda",
);
