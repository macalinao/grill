import type { PdaHook } from "@macalinao/grill";
import type { MinterSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMinterPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Minter.
 */
export const useMinterPda: PdaHook<MinterSeeds, Address> = createPdaHook(
  findMinterPda,
  "minterPda",
);
