import type { Mint } from "@solana-program/token";
import type { UseDecodedAccountHook } from "../hooks/create-decoded-account-hook.js";
import type { UseDecodedAccountsHook } from "../hooks/create-decoded-accounts-hook.js";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMintDecoder } from "@solana-program/token";

/**
 * Hook for fetching and decoding a mint account
 * Useful for getting token information like decimals, supply, and authorities
 */
export const useMintAccount: UseDecodedAccountHook<Mint> =
  createDecodedAccountHook(getMintDecoder());

/**
 * Hook for fetching and decoding multiple mint accounts
 * Useful for getting token information like decimals, supply, and authorities
 */
export const useMintAccounts: UseDecodedAccountsHook<Mint> =
  createDecodedAccountsHook(getMintDecoder());
