import type { Address } from "@solana/kit";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import type { AccountFetchResult } from "../accounts";
import { useKite } from "../provider";

export const useAccountData = (
  accountId: Address | null | undefined,
): {
  data: AccountFetchResult | null | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const { fetchAccount, emitter } = useKite();

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["kite-account", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      return fetchAccount(accountId);
    },
    enabled: !!accountId,
    staleTime: 30_000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const refetch = useCallback(async () => {
    if (!accountId) return;
    await queryRefetch();
  }, [accountId, queryRefetch]);

  // Subscribe to account updates
  useEffect(() => {
    if (!accountId) return;

    const handleChange = (event: { type: string; keys?: Set<Address> }) => {
      if (event.type === "clear" || (event.type === "batchUpdate" && event.keys?.has(accountId))) {
        void queryRefetch();
      }
    };

    emitter.on("change", handleChange);
    return () => {
      emitter.off("change", handleChange);
    };
  }, [accountId, emitter, queryRefetch]);

  return {
    data,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
};