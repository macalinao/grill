import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findOperatorPda, type OperatorSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Operator.
 */
export const useOperatorPda: PdaHook<OperatorSeeds, Address> = createPdaHook(
  findOperatorPda,
  "operatorPda",
);
