import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getAddressLookupTableDecoder } from "@solana-program/address-lookup-table";

export const useAddressLookupTable: UseDecodedAccountHook<object> =
  createDecodedAccountHook(getAddressLookupTableDecoder());

export const useAddressLookupTables: UseDecodedAccountsHook<object> =
  createDecodedAccountsHook(getAddressLookupTableDecoder());
