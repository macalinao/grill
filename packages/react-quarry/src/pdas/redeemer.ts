import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { RedeemerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findRedeemerPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Redeemer.
 * Computes the deterministic address for a Redeemer account
 * based on the IOU mint and redemption mint.
 *
 * @param seeds - The seeds for deriving the Redeemer PDA
 * @param seeds.iouMint - The IOU token mint address
 * @param seeds.redemptionMint - The redemption token mint address
 * @returns The computed Redeemer PDA address
 *
 * @example
 * ```tsx
 * const redeemerPda = useRedeemerPda({
 *   iouMint: iouMintAddress,
 *   redemptionMint: redemptionMintAddress
 * });
 * ```
 */
export const useRedeemerPda: PdaHook<RedeemerSeeds, Address> = createPdaHook(
  findRedeemerPda,
  "redeemerPda",
);

/**
 * Hook to derive multiple PDA addresses for Redeemers.
 * Computes deterministic addresses for multiple Redeemer accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Redeemer PDAs
 * @returns Array of computed Redeemer PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const redeemerPdas = useRedeemerPdas([
 *   { iouMint: iouMintAddress1, redemptionMint: redemptionMintAddress1 },
 *   { iouMint: iouMintAddress2, redemptionMint: redemptionMintAddress2 }
 * ]);
 * ```
 */
export const useRedeemerPdas: PdasHook<RedeemerSeeds, Address> = createPdasHook(
  findRedeemerPda,
  "redeemerPda",
);
