import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findMinterPda, type MinterSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Minter.
 */
export const useMinterPda: PdaHook<MinterSeeds, Address> = createPdaHook(
  findMinterPda,
  "minterPda",
);
