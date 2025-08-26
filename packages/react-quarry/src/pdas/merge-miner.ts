import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findMergeMinerPda, type MergeMinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a MergeMiner.
 */
export const useMergeMinerPda: PdaHook<MergeMinerSeeds, Address> =
  createPdaHook(findMergeMinerPda, "mergeMinerPda");
