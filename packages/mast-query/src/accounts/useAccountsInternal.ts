import { createBatchAccountsLoader } from "@macalinao/solana-batch-accounts-loader";
import type { Address } from "@solana/kit";
import { createSolanaRpc } from "@solana/kit";
import { useConnection } from "@solana/wallet-adapter-react";
import type { AccountInfo } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { MastError } from "../errors/index.js";
import { MastRefetchSubscriptionsError } from "../errors/index.js";
import type { CacheBatchUpdateEvent } from "./emitter.js";
import { AccountsEmitter } from "./emitter.js";
import type { AccountFetchResult } from "./fetchers.js";

export type AccountLoader = ReturnType<typeof createBatchAccountsLoader>;

const getCacheKeyOfPublicKey = (key: PublicKey): string => key.toBase58();

export type AccountDatum =
  | {
      accountId: PublicKey;
      accountInfo: AccountInfo<Buffer>;
    }
  | null
  | undefined;

interface AccountsProviderState {
  accountsCache: Map<string, AccountInfo<Buffer> | null>;
  emitter: AccountsEmitter;
  subscribedAccounts: Map<string, number>;
}

const newState = (): AccountsProviderState => ({
  accountsCache: new Map<string, AccountInfo<Buffer> | null>(),
  emitter: new AccountsEmitter(),
  subscribedAccounts: new Map(),
});

export interface UseAccountsArgs {
  /**
   * Duration in ms in which to batch all accounts data requests. Defaults to 500ms.
   */
  batchDurationMs?: number;
  /**
   * Milliseconds between each refresh. Defaults to 60_000.
   */
  refreshIntervalMs?: number;
  /**
   * Called whenever an error occurs.
   */
  onError: (err: MastError) => void;
  /**
   * If true, allows one to subscribe to account updates via websockets rather than via polling.
   */
  useWebsocketAccountUpdates?: boolean;
  /**
   * If true, disables periodic account refetches for subscriptions.
   */
  disableAutoRefresh?: boolean;
}

/**
 * Function signature for fetching keys.
 */
export type FetchKeysFn = (
  keys: readonly PublicKey[],
) => Promise<readonly AccountFetchResult[]>;

/**
 * Fetches keys, passing through null/undefined values.
 * @param fetchKeys
 * @param keys
 * @returns
 */
export const fetchKeysMaybe = async (
  fetchKeys: FetchKeysFn,
  keys: readonly (PublicKey | null | undefined)[],
): Promise<readonly (AccountFetchResult | null | undefined)[]> => {
  const keysWithIndex = keys.map((k, i) => [k, i] as const);
  const nonEmptyKeysWithIndex = keysWithIndex.filter(
    (key): key is readonly [PublicKey, number] => key[0] != null,
  );
  const nonEmptyKeys = nonEmptyKeysWithIndex.map((n) => n[0]);
  const accountsData = await fetchKeys(nonEmptyKeys);

  const result: (AccountFetchResult | null | undefined)[] = keys.slice() as (
    | AccountFetchResult
    | null
    | undefined
  )[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nonEmptyKeysWithIndex.forEach(([_, originalIndex], i) => {
    result[originalIndex] = accountsData[i];
  });
  return result;
};

export interface UseAccounts extends Required<UseAccountsArgs> {
  /**
   * The loader. Usually should not be used directly.
   */
  loader: AccountLoader;

  /**
   * Refetches an account.
   */
  refetch: (key: PublicKey) => Promise<AccountInfo<Buffer> | null>;
  /**
   * Refetches multiple accounts.
   */
  refetchMany: (
    keys: readonly PublicKey[],
  ) => Promise<(AccountInfo<Buffer> | Error | null)[]>;
  /**
   * Refetches all accounts that are being subscribed to.
   */
  refetchAllSubscriptions: () => Promise<void>;

  /**
   * Registers a callback to be called whenever a batch of items is cached.
   */
  onBatchCache: (cb: (args: CacheBatchUpdateEvent) => void) => void;

  /**
   * Fetches the data associated with the given keys, via the AccountLoader.
   */
  fetchKeys: FetchKeysFn;

  /**
   * Causes a key to be refetched periodically.
   */
  subscribe: (key: PublicKey) => () => Promise<void>;

  /**
   * Gets the cached data of an account.
   */
  getCached: (key: PublicKey) => AccountInfo<Buffer> | null | undefined;
  /**
   * Gets an AccountDatum from the cache.
   *
   * If the AccountInfo has never been fetched, this returns undefined.
   * If the AccountInfo has been fetched but wasn't found, this returns null.
   */
  getDatum: (key: PublicKey | null | undefined) => AccountDatum;
}

export const useAccountsInternal = (args: UseAccountsArgs): UseAccounts => {
  const {
    batchDurationMs = 500,
    refreshIntervalMs = 60_000,
    onError,
    useWebsocketAccountUpdates = false,
    disableAutoRefresh: disableRefresh = false,
  } = args;
  const { connection } = useConnection();

  // Cache of accounts
  const [{ accountsCache, emitter, subscribedAccounts }, setState] =
    useState<AccountsProviderState>(newState());

  useEffect(() => {
    setState((prevState) => {
      // clear accounts cache and subscriptions whenever the network changes
      prevState.accountsCache.clear();
      prevState.subscribedAccounts.clear();
      prevState.emitter.raiseCacheCleared();
      return newState();
    });
  }, [connection]);

  const accountLoader = useMemo(() => {
    const rpc = createSolanaRpc(connection.rpcEndpoint);
    return createBatchAccountsLoader({
      rpc,
      commitment: "confirmed",
      batchDurationMs,
      onFetchAccounts: (addresses: string[]) => {
        const batch = new Set<string>();
        addresses.forEach((addr: string) => {
          batch.add(addr);
        });
        emitter.raiseBatchCacheUpdated(batch);
      },
    });
  }, [batchDurationMs, connection, emitter]);

  const fetchKeys = useCallback(
    async (
      keys: readonly PublicKey[],
    ): Promise<readonly AccountFetchResult[]> => {
      const results = await Promise.all(
        keys.map(async (key) => {
          const keyStr = getCacheKeyOfPublicKey(key);
          const accountInfo = await accountLoader.load(keyStr);
          if (accountInfo) {
            const info: AccountInfo<Buffer> = {
              data: Buffer.from(accountInfo.data),
              executable: accountInfo.executable,
              lamports: Number(accountInfo.lamports),
              owner: new PublicKey(accountInfo.owner),
              rentEpoch: Number(accountInfo.rentEpoch),
            };
            accountsCache.set(keyStr, info);
            return {
              data: new Uint8Array(info.data),
              executable: info.executable,
              lamports: BigInt(info.lamports),
              owner: info.owner.toBase58() as Address,
            } satisfies AccountFetchResult;
          }
          accountsCache.set(keyStr, null);
          // Return a "null" account fetch result
          return {
            data: null,
            executable: false,
            lamports: BigInt(0),
            owner: "11111111111111111111111111111111" as Address,
          } satisfies AccountFetchResult;
        }),
      );
      return results;
    },
    [accountLoader, accountsCache],
  );

  const onBatchCache = emitter.onBatchCache;

  const refetch = useCallback(
    async (key: PublicKey) => {
      const keyStr = getCacheKeyOfPublicKey(key);
      accountLoader.clear(keyStr);
      const accountInfo = await accountLoader.load(keyStr);
      if (accountInfo) {
        const info: AccountInfo<Buffer> = {
          data: Buffer.from(accountInfo.data),
          executable: accountInfo.executable,
          lamports: Number(accountInfo.lamports),
          owner: new PublicKey(accountInfo.owner),
          rentEpoch: Number(accountInfo.rentEpoch),
        };
        accountsCache.set(keyStr, info);
        return info;
      }
      accountsCache.set(keyStr, null);
      return null;
    },
    [accountLoader, accountsCache],
  );

  const refetchMany = useCallback(
    async (keys: readonly PublicKey[]) => {
      const keyStrs = keys.map(getCacheKeyOfPublicKey);
      keyStrs.forEach((keyStr) => {
        accountLoader.clear(keyStr);
      });
      const results = await accountLoader.loadMany(keyStrs);
      return results.map((result, i) => {
        const keyStr = keyStrs[i];
        if (!keyStr) {
          return null;
        }

        if (result instanceof Error) {
          return result;
        }

        if (result) {
          const info: AccountInfo<Buffer> = {
            data: Buffer.from(result.data),
            executable: result.executable,
            lamports: Number(result.lamports),
            owner: new PublicKey(result.owner),
            rentEpoch: Number(result.rentEpoch),
          };
          accountsCache.set(keyStr, info);
          return info;
        }
        accountsCache.set(keyStr, null);
        return null;
      });
    },
    [accountLoader, accountsCache],
  );

  const getCached = useCallback(
    (key: PublicKey): AccountInfo<Buffer> | null | undefined => {
      // null: account not found on blockchain
      // undefined: cache miss (not yet fetched)
      return accountsCache.get(getCacheKeyOfPublicKey(key));
    },
    [accountsCache],
  );

  const subscribe = useCallback(
    (key: PublicKey): (() => Promise<void>) => {
      const keyStr = getCacheKeyOfPublicKey(key);
      const amount = subscribedAccounts.get(keyStr);
      if (amount === undefined || amount === 0) {
        subscribedAccounts.set(keyStr, 1);
      } else {
        subscribedAccounts.set(keyStr, amount + 1);
      }

      let listener: number | null = null;
      if (useWebsocketAccountUpdates) {
        listener = connection.onAccountChange(key, (data) => {
          const cacheKey = getCacheKeyOfPublicKey(key);
          accountsCache.set(cacheKey, data);
          // Clear and prime the loader with the new data
          accountLoader.clear(cacheKey);
          accountLoader.prime(cacheKey, {
            data: new Uint8Array(data.data),
            executable: data.executable,
            lamports: data.lamports as any,
            owner: data.owner.toBase58() as Address,
            rentEpoch: BigInt(data.rentEpoch ?? 0),
            space: BigInt(data.data.length),
          });
          emitter.raiseBatchCacheUpdated(new Set([cacheKey]));
        });
      }

      return async () => {
        const currentAmount = subscribedAccounts.get(keyStr);
        if ((currentAmount ?? 0) > 1) {
          subscribedAccounts.set(keyStr, (currentAmount ?? 0) - 1);
        } else {
          subscribedAccounts.delete(keyStr);
        }
        if (listener) {
          await connection.removeAccountChangeListener(listener);
        }
      };
    },
    [
      accountLoader,
      accountsCache,
      connection,
      emitter,
      subscribedAccounts,
      useWebsocketAccountUpdates,
    ],
  );

  const refetchAllSubscriptions = useCallback(async () => {
    const keysToFetch = [...subscribedAccounts.keys()].map((keyStr) => {
      return new PublicKey(keyStr);
    });
    await refetchMany(keysToFetch);
  }, [refetchMany, subscribedAccounts]);

  useEffect(() => {
    // don't auto refetch if we're disabling the refresh
    if (disableRefresh) {
      return;
    }
    const interval = setInterval(() => {
      void refetchAllSubscriptions().catch((e: unknown) => {
        onError(new MastRefetchSubscriptionsError(e));
      });
    }, refreshIntervalMs);
    return () => {
      clearInterval(interval);
    };
  }, [disableRefresh, onError, refetchAllSubscriptions, refreshIntervalMs]);

  const getDatum = useCallback(
    (k: PublicKey | null | undefined) => {
      if (!k) {
        return k;
      }
      const accountInfo = getCached(k);
      if (accountInfo) {
        return {
          accountId: k,
          accountInfo,
        };
      }
      return accountInfo;
    },
    [getCached],
  );

  return {
    loader: accountLoader,
    getCached,
    getDatum,
    refetch,
    refetchMany,
    refetchAllSubscriptions,

    onBatchCache,

    fetchKeys,
    subscribe,

    batchDurationMs,
    refreshIntervalMs,
    useWebsocketAccountUpdates,
    disableAutoRefresh: disableRefresh,
    onError,
  };
};
