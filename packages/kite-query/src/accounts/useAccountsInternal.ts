import type {
  Address,
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  Rpc,
} from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";

import type { KiteError } from "../errors";
import {
  KiteCacheRefetchError,
  KiteRefetchSubscriptionsError,
} from "../errors";
import { KiteBatchProvider } from "./batchProvider";
import { AccountsEmitter } from "./emitter";
import type { AccountFetchResult } from "./fetchers";
import {
  fetchAccountsUsingProvider,
  fetchAccountUsingProvider,
} from "./fetchers";

export interface UseAccountsArgs {
  rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
  commitment?: "confirmed" | "finalized";
  onError?: (error: KiteError) => void;
}

export interface UseAccounts {
  fetchAccount: (key: Address) => Promise<AccountFetchResult | null>;
  fetchAccounts: (
    keys: Address[],
  ) => Promise<Map<Address, AccountFetchResult | null>>;
  refetch: (keys: Address[]) => Promise<void>;
  refetchAll: () => Promise<void>;
  refetchMany: (keys: readonly Address[]) => Promise<void>;
  emitter: AccountsEmitter;
}

const QUERY_KEY_PREFIX = "kite-account";

export const useAccountsInternal = ({
  rpc,
  commitment = "confirmed",
  onError = console.error,
}: UseAccountsArgs): UseAccounts => {
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();

  const provider = useMemo(
    () => new KiteBatchProvider({ rpc, commitment }),
    [rpc, commitment],
  );

  const emitter = useMemo(() => new AccountsEmitter(), []);

  const fetchAccount = useCallback(
    async (key: Address): Promise<AccountFetchResult | null> => {
      const queryKey = [QUERY_KEY_PREFIX, key, commitment];

      try {
        const cached = queryClient.getQueryData<AccountFetchResult | null>(
          queryKey,
        );
        if (cached !== undefined) {
          return cached;
        }

        const result = await fetchAccountUsingProvider(provider, key);
        queryClient.setQueryData(queryKey, result);

        emitter.emitBatchUpdate(new Set([key]));

        return result;
      } catch (error) {
        if (error instanceof Error) {
          onError(error as KiteError);
        }
        throw error;
      }
    },
    [provider, queryClient, commitment, emitter, onError],
  );

  const fetchAccounts = useCallback(
    async (
      keys: Address[],
    ): Promise<Map<Address, AccountFetchResult | null>> => {
      if (keys.length === 0) {
        return new Map();
      }

      try {
        const results = await fetchAccountsUsingProvider(provider, keys);

        // Update cache for each result
        results.forEach((result, key) => {
          const queryKey = [QUERY_KEY_PREFIX, key, commitment];
          queryClient.setQueryData(queryKey, result);
        });

        emitter.emitBatchUpdate(new Set(keys));

        return results;
      } catch (error) {
        if (error instanceof Error) {
          onError(error as KiteError);
        }
        throw error;
      }
    },
    [provider, queryClient, commitment, emitter, onError],
  );

  const refetch = useCallback(
    async (keys: Address[]): Promise<void> => {
      if (keys.length === 0) {
        return;
      }

      try {
        // Clear cache for these keys
        keys.forEach((key) => {
          provider.clear(key);
          const queryKey = [QUERY_KEY_PREFIX, key, commitment];
          queryClient.removeQueries({ queryKey });
        });

        // Refetch
        await fetchAccounts(keys);
      } catch (error) {
        throw new KiteRefetchSubscriptionsError(error);
      }
    },
    [provider, queryClient, commitment, fetchAccounts],
  );

  const refetchAll = useCallback(async (): Promise<void> => {
    try {
      provider.clearAll();
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEY_PREFIX],
      });
      emitter.emitClear();
    } catch (error) {
      throw new KiteCacheRefetchError(error);
    }
  }, [provider, queryClient, emitter]);

  const refetchMany = useDebouncedCallback(
    async (keys: readonly Address[]): Promise<void> => {
      if (keys.length === 0) {
        return;
      }
      await refetch([...keys]);
    },
    100,
    { leading: true, trailing: true },
  );

  // Refetch user account when wallet changes
  useQuery({
    queryKey: [QUERY_KEY_PREFIX, "user", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        return null;
      }
      return fetchAccount(publicKey.toBase58() as Address);
    },
    enabled: !!publicKey,
    refetchInterval: 60_000, // Refetch every minute
  });

  return {
    fetchAccount,
    fetchAccounts,
    refetch,
    refetchAll,
    refetchMany,
    emitter,
  };
};
