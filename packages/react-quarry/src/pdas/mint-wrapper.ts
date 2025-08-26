import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findMintWrapperPda, type MintWrapperSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a MintWrapper.
 */
export const useMintWrapperPda: PdaHook<MintWrapperSeeds, Address> =
  createPdaHook(findMintWrapperPda, "mintWrapperPda");
