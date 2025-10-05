import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { ReplicaMintSeeds } from "@macalinao/quarry";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findReplicaMintPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a ReplicaMint.
 * Computes the deterministic address for a ReplicaMint account
 * used in merge mining for secondary rewards.
 *
 * @param seeds - The seeds for deriving the ReplicaMint PDA
 * @param seeds.primaryMint - The primary token mint address
 * @param seeds.replicaMintIndex - The index of the replica mint
 * @returns The computed ReplicaMint PDA address
 *
 * @example
 * ```tsx
 * const replicaMintPda = useReplicaMintPda({
 *   primaryMint: primaryMintAddress,
 *   replicaMintIndex: 0
 * });
 * ```
 */
export const useReplicaMintPda: PdaHook<ReplicaMintSeeds> = createPdaHook(
  findReplicaMintPda,
  "replicaMintPda",
);

/**
 * Hook to derive multiple PDA addresses for ReplicaMints.
 * Computes deterministic addresses for multiple ReplicaMint accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving ReplicaMint PDAs
 * @returns Array of computed ReplicaMint PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const replicaMintPdas = useReplicaMintPdas([
 *   { primaryMint: primaryMintAddress1, replicaMintIndex: 0 },
 *   { primaryMint: primaryMintAddress2, replicaMintIndex: 1 }
 * ]);
 * ```
 */
export const useReplicaMintPdas: PdasHook<ReplicaMintSeeds> = createPdasHook(
  findReplicaMintPda,
  "replicaMintPda",
);
