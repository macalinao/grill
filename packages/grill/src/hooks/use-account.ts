import type { UseQueryResult } from "@tanstack/react-query";
import type {
  Account,
  Address,
  Decoder,
  FetchAccountConfig,
  Simplify,
} from "gill";
import type { GillUseRpcHook } from "./types.js";
import { useQuery } from "@tanstack/react-query";
import { useGrillContext } from "../contexts/grill-context.js";
import {
  createAccountQueryKey,
  fetchAndDecodeAccount,
} from "../utils/account-helpers.js";

type RpcConfig = Simplify<Omit<FetchAccountConfig, "abortSignal">>;

type UseAccountInput<
  TConfig extends RpcConfig = RpcConfig,
  TDecodedData extends object = Uint8Array,
> = GillUseRpcHook<TConfig> & {
  /**
   * Address of the account to get the balance of.
   */
  address: Address | null | undefined;
  /**
   * Account decoder that can decode the account's `data` byte array value.
   *
   * Note: if not provided, the account will be returned as a `Uint8Array`.
   */
  decoder?: Decoder<TDecodedData>;
};

/**
 * Get the account info for an address. Concurrent queries are batched using a DataLoader.
 */
export function useAccount<
  TConfig extends RpcConfig = RpcConfig,
  TDecodedData extends object = Uint8Array,
>({
  options,
  address,
  decoder,
}: UseAccountInput<
  TConfig,
  TDecodedData
>): UseQueryResult<Account<TDecodedData> | null> & {
  address: Address | null | undefined;
} {
  const { accountLoader } = useGrillContext();
  // TODO(igm): improve the types here and somehow ensure the decoder is the same
  // for each query of an account
  return {
    ...(useQuery({
      networkMode: "offlineFirst",
      ...options,
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: address ? createAccountQueryKey(address) : [null],
      queryFn: () => fetchAndDecodeAccount(address, accountLoader, decoder),
      enabled: !!address,
    }) as UseQueryResult<Account<TDecodedData> | null>),
    address,
  };
}
