import type { PdaHook } from "@macalinao/grill";
import type { RewarderSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findRewarderPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Rewarder.
 * Computes the deterministic address for a Rewarder account
 * that manages reward distribution across quarries.
 *
 * @param seeds - The seeds for deriving the Rewarder PDA
 * @param seeds.base - The base address for the rewarder
 * @param seeds.mintWrapper - The mint wrapper address for reward tokens
 * @returns The computed Rewarder PDA address
 *
 * @example
 * ```tsx
 * const rewarderPda = useRewarderPda({
 *   base: baseAddress,
 *   mintWrapper: mintWrapperAddress
 * });
 * ```
 */
export const useRewarderPda: PdaHook<RewarderSeeds, Address> = createPdaHook(
  findRewarderPda,
  "rewarderPda",
);
