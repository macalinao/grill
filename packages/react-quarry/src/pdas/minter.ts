import type { PdaHook } from "@macalinao/grill";
import type { MinterSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMinterPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Minter.
 * Computes the deterministic address for a Minter account
 * based on the mint wrapper and authority.
 *
 * @param seeds - The seeds for deriving the Minter PDA
 * @param seeds.mintWrapper - The mint wrapper address
 * @param seeds.authority - The authority that controls minting
 * @returns The computed Minter PDA address
 *
 * @example
 * ```tsx
 * const minterPda = useMinterPda({
 *   mintWrapper: mintWrapperAddress,
 *   authority: authorityAddress
 * });
 * ```
 */
export const useMinterPda: PdaHook<MinterSeeds, Address> = createPdaHook(
  findMinterPda,
  "minterPda",
);
