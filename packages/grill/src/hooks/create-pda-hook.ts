import { useQuery } from "@tanstack/react-query";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";

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
  pdaFn: (args: TArgs) => Promise<readonly [TResult, number]>,
  queryKeyPrefix: string,
) {
  return function usePda(
    args: TArgs | null | undefined,
  ): TResult | null | undefined {
    const { data } = useQuery<TResult | null>({
      queryKey: [GRILL_HOOK_CLIENT_KEY, "pda", queryKeyPrefix, args] as const,
      queryFn: async () => {
        if (!args) {
          return null;
        }
        const [pda] = await pdaFn(args);
        return pda;
      },
      enabled: !!args,
      // PDAs are deterministic, so we can cache them indefinitely
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    });
    return data;
  };
}
