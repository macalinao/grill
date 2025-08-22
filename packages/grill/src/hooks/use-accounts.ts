import { useQueries } from "@tanstack/react-query";
import type {
  Account,
  Address,
  Decoder,
  FetchAccountConfig,
  Simplify,
} from "gill";
import { useGrillContext } from "../contexts/grill-context.js";
import {
  createAccountQueryKey,
  fetchAndDecodeAccount,
} from "../utils/account-helpers.js";
import type { GillUseRpcHook } from "./types.js";

type RpcConfig = Simplify<Omit<FetchAccountConfig, "abortSignal">>;

export type UseAccountsInput<
  TConfig extends RpcConfig = RpcConfig,
  TDecodedData extends object = Uint8Array,
> = GillUseRpcHook<TConfig> & {
  /**
   * Addresses of the accounts to get the info of.
   */
  addresses: (Address | null | undefined)[];
  /**
   * Account decoder that can decode the account's `data` byte array value.
   *
   * Note: if not provided, the account will be returned as a `Uint8Array`.
   */
  decoder?: Decoder<TDecodedData>;
};

export type UseAccountsResult<TDecodedData extends object> =
  | {
      isLoading: true;
      data: (Account<TDecodedData> | null | undefined)[];
    }
  | {
      isLoading: false;
      data: (Account<TDecodedData> | null)[];
    };

/**
 * Get account info for multiple addresses with automatic batching via DataLoader.
 * Concurrent queries are automatically batched into a single RPC call.
 *
 * @example
 * ```tsx
 * const tokenAccounts = useAccounts({
 *   addresses: [tokenAccount1, tokenAccount2, tokenAccount3],
 *   decoder: tokenAccountDecoder,
 * });
 *
 * // Access individual results
 * tokenAccounts.forEach((result, index) => {
 *   if (result.data) {
 *     console.log(`Account ${index}:`, result.data);
 *   }
 * });
 * ```
 */
export function useAccounts<
  TConfig extends RpcConfig = RpcConfig,
  TDecodedData extends object = Uint8Array,
>({
  options,
  addresses,
  decoder,
}: UseAccountsInput<TConfig, TDecodedData>): UseAccountsResult<TDecodedData> {
  const { accountLoader } = useGrillContext();
  return useQueries({
    queries: addresses.map((address) => ({
      networkMode: "offlineFirst" as const,
      ...options,
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: address ? createAccountQueryKey(address) : [null],
      queryFn: (): Promise<Account<TDecodedData> | null> =>
        fetchAndDecodeAccount(address, accountLoader, decoder),
      enabled: !!address,
    })),
    combine: (results) => {
      const isLoading = results.some(
        (result) => result.isLoading || result.data === undefined,
      );
      if (isLoading) {
        return {
          isLoading: true,
          data: results.map((result) => result.data),
        };
      }
      return {
        isLoading: false,
        data: results
          .map((result) => result.data)
          .filter((r) => r !== undefined),
      };
    },
  });
}
