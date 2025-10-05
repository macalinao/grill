import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { QuarrySeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findQuarryPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Quarry.
 * Computes the deterministic address for a Quarry account
 * based on the rewarder and token mint.
 *
 * @param seeds - The seeds for deriving the Quarry PDA
 * @param seeds.rewarder - The rewarder address
 * @param seeds.tokenMint - The token mint to be staked in this quarry
 * @returns The computed Quarry PDA address
 *
 * @example
 * ```tsx
 * const quarryPda = useQuarryPda({
 *   rewarder: rewarderAddress,
 *   tokenMint: tokenMintAddress
 * });
 * ```
 */
export const useQuarryPda: PdaHook<QuarrySeeds, Address> = createPdaHook(
  findQuarryPda,
  "quarryPda",
);

/**
 * Hook to derive multiple PDA addresses for Quarries.
 * Computes deterministic addresses for multiple Quarry accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Quarry PDAs
 * @returns Array of computed Quarry PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const quarryPdas = useQuarryPdas([
 *   { rewarder: rewarderAddress1, tokenMint: tokenMintAddress1 },
 *   { rewarder: rewarderAddress2, tokenMint: tokenMintAddress2 }
 * ]);
 * ```
 */
export const useQuarryPdas: PdasHook<QuarrySeeds, Address> = createPdasHook(
  findQuarryPda,
  "quarryPda",
);
