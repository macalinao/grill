import type { PdaHook } from "@macalinao/grill";
import type { RedeemerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findRedeemerPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Redeemer.
 */
export const useRedeemerPda: PdaHook<RedeemerSeeds, Address> = createPdaHook(
  findRedeemerPda,
  "redeemerPda",
);
