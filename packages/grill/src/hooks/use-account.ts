import type { QueryKey, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type {
  Account,
  Address,
  Decoder,
  FetchAccountConfig,
  Simplify,
} from "gill";
import { decodeAccount } from "gill";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";
import { useGrillContext } from "../contexts/grill-context.js";
import type { GillUseRpcHook } from "./types.js";

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
 * Create a query key for the account query
 * @param address - The address of the account
 * @returns The query key
 */
export const createAccountQueryKey = (address: Address): QueryKey =>
  [GRILL_HOOK_CLIENT_KEY, "account", address] as const;

/**
 * Get the account info for an address using the Solana RPC method of
 * [`getAccountInfo`](https://solana.com/docs/rpc/http/getaccountinfo)
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
>): UseQueryResult<Account<TDecodedData> | null> {
  const { accountLoader } = useGrillContext();
  // TODO(igm): improve the types here and somehow ensure the decoder is the same
  // for each query of an account
  return useQuery({
    networkMode: "offlineFirst",
    ...options,
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: address ? createAccountQueryKey(address) : [null],
    queryFn: async (): Promise<Account<TDecodedData> | null> => {
      if (!address) {
        return null;
      }
      const account = await accountLoader.load(address);
      if (!account) {
        return null;
      }
      if (decoder) {
        return decodeAccount(account, decoder);
      }
      return account as Account<TDecodedData>;
    },
    enabled: !!address,
  }) as UseQueryResult<Account<TDecodedData> | null>;
}
