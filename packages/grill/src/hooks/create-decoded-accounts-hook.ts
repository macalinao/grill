import type { Address, Decoder } from "@solana/kit";
import type { UseAccountsResult } from "./use-accounts.js";
import { useAccounts } from "./use-accounts.js";

/**
 * A hook for fetching and decoding multiple accounts.
 */
export type UseDecodedAccountsHook<TData extends object> = (args: {
  addresses: (Address | null | undefined)[];
}) => UseAccountsResult<TData>;

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
  }: {
    addresses: (Address | null | undefined)[];
  }): UseAccountsResult<TData> {
    return useAccounts({
      addresses,
      decoder,
    });
  };
}
