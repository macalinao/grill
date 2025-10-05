import type { PdaHook } from "@macalinao/grill";
import type { RewarderSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
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

/**
 * Hook to derive multiple PDA addresses for Rewarders.
 * Computes deterministic addresses for multiple Rewarder accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Rewarder PDAs
 * @returns Array of computed Rewarder PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const rewarderPdas = useRewarderPdas([
 *   { base: baseAddress1, mintWrapper: mintWrapperAddress1 },
 *   { base: baseAddress2, mintWrapper: mintWrapperAddress2 }
 * ]);
 * ```
 */
export const useRewarderPdas = createPdasHook(findRewarderPda, "rewarderPda");
