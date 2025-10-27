import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { AssociatedTokenSeeds } from "@solana-program/token";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findAssociatedTokenPda } from "@solana-program/token";

/**
 * Hook to compute the Associated Token Account (ATA) address for a given mint and owner
 *
 * @example
 * ```typescript
 * const { data: ataPda, isLoading } = useAssociatedTokenPda({
 *   mint: mintAddress,
 *   owner: ownerAddress,
 *   tokenProgram: TOKEN_PROGRAM_ADDRESS,
 * });
 *
 * if (ataPda) {
 *   const [ataAddress, bump] = ataPda;
 *   console.log("ATA address:", ataAddress);
 * }
 * ```
 */
export const useAssociatedTokenPda: PdaHook<AssociatedTokenSeeds> =
  createPdaHook(findAssociatedTokenPda, "associatedTokenPda");

/**
 * Hook to compute multiple Associated Token Account (ATA) addresses for given mints and owners
 *
 * @example
 * ```typescript
 * const { data: ataPdas, isLoading } = useAssociatedTokenPdas([
 *   { mint: mintAddress1, owner: ownerAddress1 },
 *   { mint: mintAddress2, owner: ownerAddress2 },
 * ]);
 *
 * ataPdas?.forEach((ataPda, index) => {
 *   if (ataPda) {
 *     const [ataAddress, bump] = ataPda;
 *     console.log(`ATA ${index} address:`, ataAddress);
 *   }
 * });
 * ```
 */
export const useAssociatedTokenPdas: PdasHook<AssociatedTokenSeeds> =
  createPdasHook(findAssociatedTokenPda, "associatedTokenPdas");
