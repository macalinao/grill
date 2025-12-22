import type { Account, Address, Decoder } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import type { UseAccountOptions } from "./use-account.js";
import { useAccount } from "./use-account.js";

export type DecodedAccountResult<TData extends object> =
  UseQueryResult<Account<TData> | null> & {
    address: Address | null | undefined;
  };

/**
 * Input for a decoded account hook.
 */
export type UseDecodedAccountInput = {
  address: Address | null | undefined;
} & UseAccountOptions;

/**
 * A hook for fetching and decoding accounts.
 */
export type UseDecodedAccountHook<TData extends object> = (
  args: UseDecodedAccountInput,
) => DecodedAccountResult<TData>;

/**
 * Generic helper to create a hook for fetching and decoding accounts
 * @param decoder - The decoder to use for the account data
 * @returns A hook function that fetches and decodes the account
 *
 * @example
 * ```tsx
 * import { createDecodedAccountHook } from "@macalinao/grill";
 * import { getPoolDecoder } from "@macalinao/clients-meteora-damm-v2";
 *
 * const usePool = createDecodedAccountHook(getPoolDecoder());
 *
 * function PoolDisplay({ address }: { address: Address }) {
 *   // Basic usage
 *   const { data: pool } = usePool({ address });
 *
 *   // With real-time updates
 *   const { data: livePool } = usePool({
 *     address,
 *     subscribeToUpdates: true,
 *   });
 *
 *   return <div>{pool?.data.liquidity.toString()}</div>;
 * }
 * ```
 */
export function createDecodedAccountHook<TData extends object>(
  decoder: Decoder<TData>,
): UseDecodedAccountHook<TData> {
  return function useDecodedAccount({
    address,
    subscribeToUpdates,
  }: UseDecodedAccountInput): DecodedAccountResult<TData> {
    return useAccount({
      address,
      decoder,
      subscribeToUpdates,
    });
  };
}
