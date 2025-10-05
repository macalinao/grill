import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { MergePoolSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
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

/**
 * Hook to derive multiple PDA addresses for MergePools.
 * Computes deterministic addresses for multiple MergePool accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving MergePool PDAs
 * @returns Array of computed MergePool PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const mergePoolPdas = useMergePoolPdas([
 *   { primaryMint: tokenMintAddress1 },
 *   { primaryMint: tokenMintAddress2 }
 * ]);
 * ```
 */
export const useMergePoolPdas: PdasHook<MergePoolSeeds, Address> =
  createPdasHook(findMergePoolPda, "mergePoolPda");
