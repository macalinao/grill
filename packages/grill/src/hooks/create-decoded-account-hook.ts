import type { Account, Address, Decoder } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAccount } from "./use-account.js";

/**
 * Generic helper to create a hook for fetching and decoding accounts
 * @param decoder - The decoder to use for the account data
 * @returns A hook function that fetches and decodes the account
 */
export function createDecodedAccountHook<TData extends object>(
  decoder: Decoder<TData>,
) {
  return function useDecodedAccount({
    address,
  }: {
    address: Address | null | undefined;
  }): UseQueryResult<Account<TData> | null> {
    return useAccount({
      address,
      decoder,
    });
  };
}
