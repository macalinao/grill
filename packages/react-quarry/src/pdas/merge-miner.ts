import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { MergeMinerSeeds } from "@macalinao/quarry";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findMergeMinerPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a MergeMiner.
 * Computes the deterministic address for a MergeMiner account
 * based on the merge pool and owner.
 *
 * @param seeds - The seeds for deriving the MergeMiner PDA
 * @param seeds.mergePool - The address of the merge pool
 * @param seeds.owner - The owner of the merge miner
 * @returns The computed MergeMiner PDA address
 *
 * @example
 * ```tsx
 * const mergeMinerPda = useMergeMinerPda({
 *   mergePool: mergePoolAddress,
 *   owner: walletPublicKey
 * });
 * ```
 */
export const useMergeMinerPda: PdaHook<MergeMinerSeeds> = createPdaHook(
  findMergeMinerPda,
  "mergeMinerPda",
);

/**
 * Hook to derive multiple PDA addresses for MergeMiners.
 * Computes deterministic addresses for multiple MergeMiner accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving MergeMiner PDAs
 * @returns Array of computed MergeMiner PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const mergeMinerPdas = useMergeMinerPdas([
 *   { mergePool: mergePoolAddress1, owner: walletPublicKey1 },
 *   { mergePool: mergePoolAddress2, owner: walletPublicKey2 }
 * ]);
 * ```
 */
export const useMergeMinerPdas: PdasHook<MergeMinerSeeds> = createPdasHook(
  findMergeMinerPda,
  "mergeMinerPda",
);
