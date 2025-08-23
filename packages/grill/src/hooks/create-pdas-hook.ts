import { useQueries } from "@tanstack/react-query";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";
import type { PdaFn } from "./create-pda-hook.js";

/**
 * Result type for PDAs hook
 */
export interface PdasResult<TResult> {
  /** Whether any of the queries are still loading */
  isLoading: boolean;
  /** Array of PDAs corresponding to the input args array */
  data: (TResult | null)[];
  /** Whether all queries have been fetched at least once */
  isSuccess: boolean;
  /** Whether any query has an error */
  isError: boolean;
}

export type PdasHook<TArgs, TResult> = (
  args: (TArgs | null | undefined)[],
) => PdasResult<TResult>;

/**
 * Creates a hook for computing multiple PDAs (Program Derived Addresses) with caching
 *
 * This hook efficiently computes multiple PDAs in parallel and caches the results.
 * PDAs are deterministic, so once computed they are cached indefinitely.
 *
 * @param pdaFn - A function that computes a PDA from some arguments
 * @param queryKeyPrefix - A unique prefix for the react-query cache key
 * @returns A hook that computes and caches multiple PDAs
 *
 * @example
 * ```typescript
 * import { findAssociatedTokenPda } from "@solana-program/token";
 *
 * const useAssociatedTokenPdas = createPdasHook(
 *   findAssociatedTokenPda,
 *   "associatedTokenPda"
 * );
 *
 * // In a component:
 * const { data: pdas, isLoading } = useAssociatedTokenPdas([
 *   { mint: mintAddress1, owner: ownerAddress1, tokenProgram: TOKEN_PROGRAM_ADDRESS },
 *   { mint: mintAddress2, owner: ownerAddress2, tokenProgram: TOKEN_PROGRAM_ADDRESS },
 *   { mint: mintAddress3, owner: ownerAddress3, tokenProgram: TOKEN_PROGRAM_ADDRESS },
 * ]);
 *
 * // pdas[0] = PDA for first mint/owner pair
 * // pdas[1] = PDA for second mint/owner pair
 * // pdas[2] = PDA for third mint/owner pair
 * ```
 */
export function createPdasHook<TArgs, TResult>(
  pdaFn: PdaFn<TArgs, TResult>,
  queryKeyPrefix: string,
): PdasHook<TArgs, TResult> {
  return function usePdas(
    args: (TArgs | null | undefined)[],
  ): PdasResult<TResult> {
    return useQueries({
      queries: args.map((arg) => ({
        queryKey: [GRILL_HOOK_CLIENT_KEY, "pda", queryKeyPrefix, arg] as const,
        queryFn: async (): Promise<TResult | null> => {
          if (!arg) {
            return null;
          }
          const [pda] = await pdaFn(arg);
          return pda;
        },
        enabled: !!arg,
        // PDAs are deterministic, so we can cache them indefinitely
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
      })),
      combine: (results) => {
        return {
          isLoading: results.some((result) => result.isLoading),
          data: results.map((result) => result.data ?? null),
          isSuccess: results.every((result) => result.isSuccess),
          isError: results.some((result) => result.isError),
        };
      },
    });
  };
}
