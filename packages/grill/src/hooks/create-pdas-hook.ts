import type { PdaFn } from "@macalinao/gill-extra";
import { useQueries } from "@tanstack/react-query";
import { createPdaQuery } from "./pda-query-utils.js";

export type PdasHook<TArgs, TResult> = <T extends readonly TArgs[]>(
  args: T | null | undefined,
) => { [K in keyof T]: TResult } | null | undefined;

/**
 * Creates a hook for computing multiple PDAs (Program Derived Addresses) with caching
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
 *   "associatedTokenPdas"
 * );
 *
 * // In a component:
 * const pdas = useAssociatedTokenPdas([
 *   { mint: mintAddress1, owner: ownerAddress1, tokenProgram: TOKEN_PROGRAM_ADDRESS },
 *   { mint: mintAddress2, owner: ownerAddress2, tokenProgram: TOKEN_PROGRAM_ADDRESS },
 * ]);
 * ```
 */
export function createPdasHook<TArgs, TResult>(
  pdaFn: PdaFn<TArgs, TResult>,
  queryKeyPrefix: string,
): PdasHook<TArgs, TResult> {
  return function usePdas<T extends readonly TArgs[]>(
    args: T | null | undefined,
  ): { [K in keyof T]: TResult } | null | undefined {
    const result = useQueries({
      queries: (args ?? []).map((arg) =>
        createPdaQuery(pdaFn, queryKeyPrefix, arg),
      ),
      combine: (results) => {
        if (!args) {
          return args;
        }
        const keys = results.map((result) => result.data);
        if (keys.some((key) => key === undefined)) {
          return null;
        }
        return keys as { [K in keyof T]: TResult };
      },
    });
    return result;
  };
}
