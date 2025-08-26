import type { PdaHook } from "@macalinao/grill";
import type { MergeMinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMergeMinerPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a MergeMiner.
 */
export const useMergeMinerPda: PdaHook<MergeMinerSeeds, Address> =
  createPdaHook(findMergeMinerPda, "mergeMinerPda");
