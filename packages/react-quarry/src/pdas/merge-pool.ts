import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findMergePoolPda  } from "@macalinao/quarry";
import type {MergePoolSeeds} from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a MergePool.
 */
export const useMergePoolPda: PdaHook<MergePoolSeeds, Address> = createPdaHook(
  findMergePoolPda,
  "mergePoolPda",
);
