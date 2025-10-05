import type { PdaFn } from "@macalinao/gill-extra";
import type { Address } from "@solana/kit";
import { useQuery } from "@tanstack/react-query";
import { createPdaQuery } from "./pda-query-utils.js";

/**
 * Hook for computing a PDA from some arguments.
 */
export type PdaHook<TArgs, TResult = Address> = (
  args: TArgs | null | undefined,
) => TResult | null | undefined;

/**
 * Creates a hook for computing PDAs (Program Derived Addresses) with caching
 *
 * @param pdaFn - A function that computes a PDA from some arguments
 * @param queryKeyPrefix - A unique prefix for the react-query cache key
 * @returns A hook that computes and caches the PDA
 *
 * @example
 * ```typescript
 * import { findAssociatedTokenPda } from "@solana-program/token";
 *
 * const useAssociatedTokenPda = createPdaHook(
 *   findAssociatedTokenPda,
 *   "associatedTokenPda"
 * );
 *
 * // In a component:
 * const { data: pda, isLoading } = useAssociatedTokenPda({
 *   mint: mintAddress,
 *   owner: ownerAddress,
 *   tokenProgram: TOKEN_PROGRAM_ADDRESS,
 * });
 * ```
 */
export function createPdaHook<TArgs, TResult>(
  pdaFn: PdaFn<TArgs, TResult>,
  queryKeyPrefix: string,
): PdaHook<TArgs, TResult> {
  return function usePda(
    args: TArgs | null | undefined,
  ): TResult | null | undefined {
    const { data } = useQuery<TResult | null>(
      createPdaQuery(pdaFn, queryKeyPrefix, args),
    );
    return data;
  };
}
