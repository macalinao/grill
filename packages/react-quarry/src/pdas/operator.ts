import type { PdaHook } from "@macalinao/grill";
import type { OperatorSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findOperatorPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Operator.
 */
export const useOperatorPda: PdaHook<OperatorSeeds, Address> = createPdaHook(
  findOperatorPda,
  "operatorPda",
);
