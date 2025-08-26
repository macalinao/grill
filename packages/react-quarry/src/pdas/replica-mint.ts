import type { PdaHook } from "@macalinao/grill";
import type { ReplicaMintSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findReplicaMintPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a ReplicaMint.
 */
export const useReplicaMintPda: PdaHook<ReplicaMintSeeds, Address> =
  createPdaHook(findReplicaMintPda, "replicaMintPda");
