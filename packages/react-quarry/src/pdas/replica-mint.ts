import type { PdaHook } from "@macalinao/grill";
import type { ReplicaMintSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
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
export const useReplicaMintPda: PdaHook<ReplicaMintSeeds, Address> =
  createPdaHook(findReplicaMintPda, "replicaMintPda");
