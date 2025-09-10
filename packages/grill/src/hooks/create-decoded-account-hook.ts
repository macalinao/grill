import type { Account, Address, Decoder } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAccount } from "./use-account.js";

export type DecodedAccountResult<TData extends object> =
  UseQueryResult<Account<TData> | null> & {
    address: Address | null | undefined;
  };

/**
 * A hook for fetching and decoding accounts.
 */
export type UseDecodedAccountHook<TData extends object> = (args: {
  address: Address | null | undefined;
}) => DecodedAccountResult<TData>;

/**
 * Generic helper to create a hook for fetching and decoding accounts
 * @param decoder - The decoder to use for the account data
 * @returns A hook function that fetches and decodes the account
 */
export function createDecodedAccountHook<TData extends object>(
  decoder: Decoder<TData>,
): UseDecodedAccountHook<TData> {
  return function useDecodedAccount({
    address,
  }: {
    address: Address | null | undefined;
  }): UseQueryResult<Account<TData> | null> & {
    address: Address | null | undefined;
  } {
    return useAccount({
      address,
      decoder,
    });
  };
}
