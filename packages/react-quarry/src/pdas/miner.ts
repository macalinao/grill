import type { PdaHook } from "@macalinao/grill";
import type { MinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMinerPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Miner.
 */
export const useMinerPda: PdaHook<MinerSeeds, Address> = createPdaHook(
  findMinerPda,
  "minerPda",
);
