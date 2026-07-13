import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Mint as Token2022Mint } from "@solana-program/token-2022";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getMintDecoder } from "@solana-program/token-2022";

/**
 * Typed hooks for Token-2022 mints, built with grill's hook factories.
 *
 * Grill ships `useMintAccount`, but it decodes with the legacy
 * `@solana-program/token` decoder, which cannot read a Token-2022 mint's
 * extension data. Passing the Token-2022 decoder to `createDecodedAccountHook`
 * produces a hook that can — this is the intended way to cover an account type
 * grill does not ship a hook for.
 */
export const useToken2022Mint: UseDecodedAccountHook<Token2022Mint> =
  createDecodedAccountHook(getMintDecoder());

export const useToken2022Mints: UseDecodedAccountsHook<Token2022Mint> =
  createDecodedAccountsHook(getMintDecoder());
