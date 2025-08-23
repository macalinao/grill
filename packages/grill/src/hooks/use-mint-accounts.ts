import type { Mint } from "@solana-program/token";
import { getMintDecoder } from "@solana-program/token";
import type { UseDecodedAccountsHook } from "./create-decoded-accounts-hook.js";
import { createDecodedAccountsHook } from "./create-decoded-accounts-hook.js";

/**
 * Hook for fetching and decoding multiple mint accounts
 * Useful for getting token information like decimals, supply, and authorities for multiple mints
 */
export const useMintAccounts: UseDecodedAccountsHook<Mint> =
  createDecodedAccountsHook(getMintDecoder());
