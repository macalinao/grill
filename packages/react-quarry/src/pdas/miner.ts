import type { PdaHook } from "@macalinao/grill";
import type { MinerSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
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

/**
 * Hook to derive multiple PDA addresses for Miners.
 * Computes deterministic addresses for multiple Miner accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Miner PDAs
 * @returns Array of computed Miner PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const minerPdas = useMinerPdas([
 *   { quarry: quarryAddress1, authority: walletPublicKey1 },
 *   { quarry: quarryAddress2, authority: walletPublicKey2 }
 * ]);
 * ```
 */
export const useMinerPdas = createPdasHook(findMinerPda, "minerPda");
