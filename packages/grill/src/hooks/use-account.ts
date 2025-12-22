import type { UseQueryResult } from "@tanstack/react-query";
import type {
  Account,
  Address,
  Decoder,
  EncodedAccount,
  FetchAccountConfig,
  Simplify,
} from "gill";
import type { AccountDecoder } from "../contexts/subscription-context.js";
import type { GillUseRpcHook } from "./types.js";
import { fetchAndDecodeAccount } from "@macalinao/gill-extra";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useGrillContext } from "../contexts/grill-context.js";
import { createAccountQueryKey } from "../query-keys.js";
import { useAccountSubscription } from "./use-account-subscription.js";

type RpcConfig = Simplify<Omit<FetchAccountConfig, "abortSignal">>;

/**
 * Options for useAccount hook.
 */
export interface UseAccountOptions {
  /**
   * Whether to subscribe to real-time account updates via WebSocket.
   *
   * When enabled:
   * - Creates a WebSocket subscription to the account via `accountNotifications`
   * - Account data is automatically updated in React Query cache when changes occur on-chain
   * - Multiple components subscribing to the same account share a single WebSocket connection (de-duplicated via reference counting)
   * - Subscriptions are automatically cleaned up when all subscribers unmount
   *
   * Use this when you need real-time updates for an account, such as:
   * - Displaying live token balances
   * - Monitoring pool states in DeFi applications
   * - Tracking transaction confirmations
   *
   * @default false
   *
   * @example
   * ```tsx
   * // Subscribe to real-time updates for a Meteora pool
   * const { data: pool } = useAccount({
   *   address: POOL_ADDRESS,
   *   decoder: decodeDammV2Pool,
   *   subscribeToUpdates: true,
   * });
   *
   * // The pool data will automatically update when the on-chain state changes
   * ```
   */
  subscribeToUpdates?: boolean;
}

export type UseAccountInput<
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
} & UseAccountOptions;

/**
 * Result type for the useAccount hook.
 */
export type UseAccountResult<TDecodedData extends object> =
  UseQueryResult<Account<TDecodedData> | null> & {
    address: Address | null | undefined;
  };

/**
 * Adapts a Decoder to an AccountDecoder for subscriptions.
 * The decoder needs to be wrapped to handle the EncodedAccount format from subscriptions.
 */
function createAccountDecoderFromDecoder<TDecodedData extends object>(
  decoder: Decoder<TDecodedData> | undefined,
): AccountDecoder<TDecodedData> | undefined {
  if (!decoder) {
    return undefined;
  }

  return (encodedAccount: EncodedAccount): Account<TDecodedData> => {
    const decoded = decoder.decode(encodedAccount.data);
    return {
      ...encodedAccount,
      data: decoded,
    };
  };
}

/**
 * Get the account info for an address. Concurrent queries are batched using a DataLoader.
 *
 * @example
 * ```tsx
 * // Basic usage - fetch once
 * const { data: account } = useAccount({
 *   address: myAddress,
 *   decoder: myDecoder,
 * });
 *
 * // With subscriptions - auto-update when account changes
 * const { data: account } = useAccount({
 *   address: myAddress,
 *   decoder: myDecoder,
 *   subscribeToUpdates: true,
 * });
 * ```
 */
export function useAccount<
  TConfig extends RpcConfig = RpcConfig,
  TDecodedData extends object = Uint8Array,
>({
  options,
  address,
  decoder,
  subscribeToUpdates = false,
}: UseAccountInput<TConfig, TDecodedData>): UseAccountResult<TDecodedData> {
  const { accountLoader } = useGrillContext();

  // Memoize the account decoder for subscriptions
  const accountDecoder = useMemo(
    () => createAccountDecoderFromDecoder(decoder),
    [decoder],
  );

  // Set up subscription if enabled
  useAccountSubscription(address, accountDecoder, subscribeToUpdates);

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
