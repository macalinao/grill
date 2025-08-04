import type { Address } from "@solana/kit";
import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import type { AccountFetchResult } from "../accounts";
import { useKite } from "../provider";

export const useAccountsData = (
  accountIds: (Address | null | undefined)[],
): {
  data: Map<Address, AccountFetchResult | null>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const { fetchAccount, emitter } = useKite();

  const validAccountIds = useMemo(
    () => accountIds.filter((id): id is Address => !!id),
    [accountIds],
  );

  const queries = useQueries({
    queries: validAccountIds.map((accountId) => ({
      queryKey: ["kite-account", accountId],
      queryFn: async () => {
        const result = await fetchAccount(accountId);
        return { accountId, result };
      },
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    })),
  });

  const data = useMemo(() => {
    const map = new Map<Address, AccountFetchResult | null>();
    queries.forEach((query) => {
      if (query.data) {
        map.set(query.data.accountId, query.data.result);
      }
    });
    return map;
  }, [queries]);

  const loading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error as Error | null;

  const refetch = useCallback(async () => {
    await Promise.all(queries.map((q) => q.refetch()));
  }, [queries]);

  // Subscribe to account updates
  useEffect(() => {
    if (validAccountIds.length === 0) return;

    const accountSet = new Set(validAccountIds);
    const handleChange = (event: { type: string; keys?: Set<Address> }) => {
      if (event.type === "clear") {
        void refetch();
        return;
      }
      
      if (event.type === "batchUpdate" && event.keys) {
        const shouldRefetch = [...event.keys].some((key) => accountSet.has(key));
        if (shouldRefetch) {
          void refetch();
        }
      }
    };

    emitter.on("change", handleChange);
    return () => {
      emitter.off("change", handleChange);
    };
  }, [validAccountIds, emitter, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};