import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findMinerPda, type MinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Miner.
 */
export const useMinerPda: PdaHook<MinerSeeds, Address> = createPdaHook(
  findMinerPda,
  "minerPda",
);
