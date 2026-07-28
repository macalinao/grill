import type { DataLoader } from "@macalinao/dataloader-es";
import type { Account, Address, Decoder, EncodedAccount } from "gill";
import { decodeAccount } from "gill";
import { AccountDecodeError } from "./account-decode-error.js";

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
    try {
      return decodeAccount(account, decoder);
    } catch (cause) {
      // Wrap the raw decoder failure with the account's address/owner so the
      // React Query error state points at a specific on-chain account.
      throw new AccountDecodeError(account, { cause });
    }
  }
  return account as Account<TDecodedData>;
}
