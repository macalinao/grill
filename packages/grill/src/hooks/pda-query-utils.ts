import type { PdaFn } from "@macalinao/gill-extra";
import type { UseQueryOptions } from "@tanstack/react-query";
import { createPdaQueryKey } from "../query-keys.js";

/**
 * Creates a query configuration for computing a PDA
 */
export function createPdaQuery<TArgs, TResult>(
  pdaFn: PdaFn<TArgs, TResult>,
  queryKeyPrefix: string,
  args: TArgs | null | undefined,
): UseQueryOptions<TResult | null> {
  return {
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
  };
}
