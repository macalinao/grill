import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findRedeemerPda, type RedeemerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Redeemer.
 */
export const useRedeemerPda: PdaHook<RedeemerSeeds, Address> = createPdaHook(
  findRedeemerPda,
  "redeemerPda",
);
