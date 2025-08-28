import type { PdaHook } from "@macalinao/grill";
import type { QuarrySeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
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
