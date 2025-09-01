import { useQuery } from "@tanstack/react-query";
import { createPdaQueryKey } from "../query-keys.js";

/**
 * A function that computes a PDA from some arguments.
 */
export type PdaFn<TArgs, TResult> = (
  args: TArgs,
) => Promise<readonly [TResult, number]>;

export type PdaHook<TArgs, TResult> = (
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
    const { data } = useQuery<TResult | null>({
      queryKey: createPdaQueryKey(queryKeyPrefix, args),
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
