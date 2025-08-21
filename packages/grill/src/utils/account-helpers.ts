import type { DataLoader } from "@macalinao/dataloader-es";
import type { QueryKey } from "@tanstack/react-query";
import type { Account, Address, Decoder, EncodedAccount } from "gill";
import { decodeAccount } from "gill";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";

/**
 * Create a query key for the account query
 * @param address - The address of the account
 * @returns The query key
 */
export const createAccountQueryKey = (address: Address): QueryKey =>
  [GRILL_HOOK_CLIENT_KEY, "account", address] as const;

/**
 * Fetch and decode an account using the DataLoader
 * @param address - The address of the account to fetch
 * @param accountLoader - The DataLoader instance for batching account requests
 * @param decoder - Optional decoder for the account data
 * @returns The account data or null if not found
 */
export async function fetchAndDecodeAccount<
  TDecodedData extends object = Uint8Array,
>(
  address: Address | null | undefined,
  accountLoader: DataLoader<Address, EncodedAccount | null>,
  decoder?: Decoder<TDecodedData>,
): Promise<Account<TDecodedData> | null> {
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
}
