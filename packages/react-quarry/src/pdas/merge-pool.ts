import type { PdaHook } from "@macalinao/grill";
import type { MergePoolSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMergePoolPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a MergePool.
 */
export const useMergePoolPda: PdaHook<MergePoolSeeds, Address> = createPdaHook(
  findMergePoolPda,
  "mergePoolPda",
);
