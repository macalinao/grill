import type { Mint } from "@solana-program/token";
import type { UseDecodedAccountHook } from "./create-decoded-account-hook.js";
import { getMintDecoder } from "@solana-program/token";
import { createDecodedAccountHook } from "./create-decoded-account-hook.js";

/**
 * Hook for fetching and decoding a mint account
 * Useful for getting token information like decimals, supply, and authorities
 */
export const useMintAccount: UseDecodedAccountHook<Mint> =
  createDecodedAccountHook(getMintDecoder());
