import type { PdaHook } from "@macalinao/grill";
import type { MergePoolSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMergePoolPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a MergePool.
 * Computes the deterministic address for a MergePool account
 * based on the primary mint address.
 *
 * @param seeds - The seeds for deriving the MergePool PDA
 * @param seeds.primaryMint - The mint address of the primary staked token
 * @returns The computed MergePool PDA address
 *
 * @example
 * ```tsx
 * const mergePoolPda = useMergePoolPda({
 *   primaryMint: tokenMintAddress
 * });
 * ```
 */
export const useMergePoolPda: PdaHook<MergePoolSeeds, Address> = createPdaHook(
  findMergePoolPda,
  "mergePoolPda",
);
