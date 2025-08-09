import type { QueryKey } from "@tanstack/react-query";
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
import { useGrillContext } from "../context.js";
import type { GillUseRpcHook } from "./types.js";

type RpcConfig = Simplify<Omit<FetchAccountConfig, "abortSignal">>;

type UseAccountResponse<TData extends Uint8Array | object = Uint8Array> =
  Account<TData> & {
    exists: true;
  };

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
>({ options, address, decoder }: UseAccountInput<TConfig, TDecodedData>) {
  const { accountLoader } = useGrillContext();
  const { data, ...rest } = useQuery({
    networkMode: "offlineFirst",
    ...options,
    queryKey: address ? createAccountQueryKey(address) : [null],
    queryFn: async (): Promise<UseAccountResponse<TDecodedData> | null> => {
      if (!address) {
        return null;
      }
      const account = await accountLoader.load(address);
      if (!account) {
        return null;
      }
      if (decoder) {
        return decodeAccount(
          account,
          decoder,
        ) as UseAccountResponse<TDecodedData>;
      }
      return account as UseAccountResponse<TDecodedData>;
    },
    enabled: !!address,
  });
  return {
    ...rest,
    account: data as UseAccountResponse<TDecodedData> | null,
  };
}
