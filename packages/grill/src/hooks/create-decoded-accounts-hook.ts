import type { Address, Decoder } from "@solana/kit";
import type { UseAccountOptions } from "./use-account.js";
import type { UseAccountsResult } from "./use-accounts.js";
import { useAccounts } from "./use-accounts.js";

export type DecodedAccountsResult<TData extends object> =
  UseAccountsResult<TData> & {
    addresses: (Address | null | undefined)[];
  };

/**
 * Input for a decoded accounts hook.
 */
export type UseDecodedAccountsInput = {
  addresses: (Address | null | undefined)[];
} & UseAccountOptions;

/**
 * A hook for fetching and decoding multiple accounts.
 */
export type UseDecodedAccountsHook<TData extends object> = (
  args: UseDecodedAccountsInput,
) => UseAccountsResult<TData>;

/**
 * Generic helper to create a hook for fetching and decoding multiple accounts
 * @param decoder - The decoder to use for the account data
 * @returns A hook function that fetches and decodes multiple accounts
 */
export function createDecodedAccountsHook<TData extends object>(
  decoder: Decoder<TData>,
): UseDecodedAccountsHook<TData> {
  return function useDecodedAccounts({
    addresses,
    subscribeToUpdates,
  }: UseDecodedAccountsInput): UseAccountsResult<TData> {
    return useAccounts({
      addresses,
      decoder,
      subscribeToUpdates,
    });
  };
}
