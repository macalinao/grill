import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getAddressLookupTableDecoder } from "@solana-program/address-lookup-table";

export const useAddressLookupTable = createDecodedAccountHook(
  getAddressLookupTableDecoder(),
);

export const useAddressLookupTables = createDecodedAccountsHook(
  getAddressLookupTableDecoder(),
);
