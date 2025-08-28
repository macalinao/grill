import type { PdaHook } from "@macalinao/grill";
import type { MinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
import { findMinerPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a Miner.
 * Computes the deterministic address for a Miner account
 * based on the quarry and authority.
 *
 * @param seeds - The seeds for deriving the Miner PDA
 * @param seeds.quarry - The address of the quarry
 * @param seeds.authority - The authority (owner) of the miner
 * @returns The computed Miner PDA address
 *
 * @example
 * ```tsx
 * const minerPda = useMinerPda({
 *   quarry: quarryAddress,
 *   authority: walletPublicKey
 * });
 * ```
 */
export const useMinerPda: PdaHook<MinerSeeds, Address> = createPdaHook(
  findMinerPda,
  "minerPda",
);
