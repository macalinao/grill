import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { MinterSeeds } from "@macalinao/quarry";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
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
export const useMinterPda: PdaHook<MinterSeeds> = createPdaHook(
  findMinterPda,
  "minterPda",
);

/**
 * Hook to derive multiple PDA addresses for Minters.
 * Computes deterministic addresses for multiple Minter accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Minter PDAs
 * @returns Array of computed Minter PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const minterPdas = useMinterPdas([
 *   { mintWrapper: mintWrapperAddress1, authority: authorityAddress1 },
 *   { mintWrapper: mintWrapperAddress2, authority: authorityAddress2 }
 * ]);
 * ```
 */
export const useMinterPdas: PdasHook<MinterSeeds> = createPdasHook(
  findMinterPda,
  "minterPda",
);
