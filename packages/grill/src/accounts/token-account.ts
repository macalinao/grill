import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Token } from "@solana-program/token";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getTokenDecoder } from "@solana-program/token";

export const useTokenAccount: UseDecodedAccountHook<Token> =
  createDecodedAccountHook<Token>(getTokenDecoder());

export const useTokenAccounts: UseDecodedAccountsHook<Token> =
  createDecodedAccountsHook<Token>(getTokenDecoder());
