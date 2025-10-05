import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { MintWrapperSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findMintWrapperPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for a MintWrapper.
 * Computes the deterministic address for a MintWrapper account
 * based on the base and mint addresses.
 *
 * @param seeds - The seeds for deriving the MintWrapper PDA
 * @param seeds.base - The base address for the mint wrapper
 * @param seeds.mint - The mint address to be wrapped
 * @returns The computed MintWrapper PDA address
 *
 * @example
 * ```tsx
 * const mintWrapperPda = useMintWrapperPda({
 *   base: baseAddress,
 *   mint: tokenMintAddress
 * });
 * ```
 */
export const useMintWrapperPda: PdaHook<MintWrapperSeeds, Address> =
  createPdaHook(findMintWrapperPda, "mintWrapperPda");

/**
 * Hook to derive multiple PDA addresses for MintWrappers.
 * Computes deterministic addresses for multiple MintWrapper accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving MintWrapper PDAs
 * @returns Array of computed MintWrapper PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const mintWrapperPdas = useMintWrapperPdas([
 *   { base: baseAddress1, mint: tokenMintAddress1 },
 *   { base: baseAddress2, mint: tokenMintAddress2 }
 * ]);
 * ```
 */
export const useMintWrapperPdas: PdasHook<MintWrapperSeeds, Address> =
  createPdasHook(findMintWrapperPda, "mintWrapperPda");
