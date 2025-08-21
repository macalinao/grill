import type { QueriesResults } from "@tanstack/react-query";
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

type UseAccountsInput<
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
}: UseAccountsInput<TConfig, TDecodedData>): QueriesResults<
  (Account<TDecodedData> | null)[]
> {
  const { accountLoader } = useGrillContext();

  return useQueries({
    queries: addresses.map((address) => ({
      networkMode: "offlineFirst" as const,
      ...options,
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: address ? createAccountQueryKey(address) : [null],
      queryFn: () => fetchAndDecodeAccount(address, accountLoader, decoder),
      enabled: !!address,
    })),
  });
}
