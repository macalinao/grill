import type { PdaHook } from "@macalinao/grill";
import type { RedeemerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
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
