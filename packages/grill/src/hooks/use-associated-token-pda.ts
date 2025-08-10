import { findAssociatedTokenPda } from "@solana-program/token";
import { createPdaHook } from "./create-pda-hook.js";

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
export const useAssociatedTokenPda = createPdaHook(
  findAssociatedTokenPda,
  "associatedTokenPda",
);
