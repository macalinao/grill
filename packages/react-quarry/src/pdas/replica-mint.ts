import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findReplicaMintPda, type ReplicaMintSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a ReplicaMint.
 */
export const useReplicaMintPda: PdaHook<ReplicaMintSeeds, Address> =
  createPdaHook(findReplicaMintPda, "replicaMintPda");
