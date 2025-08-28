import type { PdaHook } from "@macalinao/grill";
import type { MergeMinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
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
export const useMergeMinerPda: PdaHook<MergeMinerSeeds, Address> =
  createPdaHook(findMergeMinerPda, "mergeMinerPda");
