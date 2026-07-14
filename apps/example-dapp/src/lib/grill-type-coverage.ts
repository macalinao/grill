/**
 * Type-level coverage guardrail for `@macalinao/grill`.
 *
 * Grill's *value* exports are checked at runtime by
 * `src/grill-export-coverage.test.ts`, which asserts each one is actually
 * referenced somewhere in this app. Types have no runtime presence, so they get
 * this instead: every type grill exports is referenced below, which means
 * renaming or deleting one fails `tsc -b`.
 *
 * Most of these are also used naturally in the example routes. The point of this
 * file is that none of them can silently disappear.
 */
import type {
  AccountData,
  AccountDecoder,
  AccountQueryKey,
  DecodedAccountResult,
  DecodedAccountsResult,
  GrillContextValue,
  GrillHeadlessProviderProps,
  GrillProviderProps,
  PdaHook,
  PdaQueryKey,
  PdasHook,
  SubscriptionManager,
  SubscriptionProviderProps,
  TokenInfoQueryKey,
  TransactionId,
  TransactionStatusEvent,
  TransactionStatusEventCallback,
  UseAccountInput,
  UseAccountOptions,
  UseAccountResult,
  UseAccountsInput,
  UseAccountsResult,
  UseAssociatedTokenAccountOptions,
  UseAssociatedTokenAccountResult,
  UseATABalanceOptions,
  UseDecodedAccountHook,
  UseDecodedAccountInput,
  UseDecodedAccountsHook,
  UseDecodedAccountsInput,
  UseTokenBalanceOptions,
  UseTokenInfoInput,
  UseTokenInfosInput,
  UseTokenInfosResult,
  WalletContextState,
  WalletProviderProps,
} from "@macalinao/grill";
import type { Mint } from "@solana-program/token";

/** Reading a single account. */
export interface AccountReadTypes {
  options: UseAccountOptions;
  input: UseAccountInput;
  result: UseAccountResult<Mint>;
}

/** Reading many accounts at once. */
export interface AccountsReadTypes {
  input: UseAccountsInput;
  result: UseAccountsResult<Mint>;
}

/** The hooks the decoded-account factories produce, and their inputs/outputs. */
export interface DecodedAccountHookTypes {
  hook: UseDecodedAccountHook<Mint>;
  hookInput: UseDecodedAccountInput;
  hookResult: DecodedAccountResult<Mint>;
  pluralHook: UseDecodedAccountsHook<Mint>;
  pluralHookInput: UseDecodedAccountsInput;
  pluralHookResult: DecodedAccountsResult<Mint>;
}

/** The hooks the PDA factories produce. */
export interface PdaHookTypes {
  hook: PdaHook<{ mint: string }>;
  pluralHook: PdasHook<{ mint: string }>;
}

/** Token identity and balances. */
export interface TokenTypes {
  infoInput: UseTokenInfoInput;
  infosInput: UseTokenInfosInput;
  infosResult: UseTokenInfosResult;
  balanceOptions: UseTokenBalanceOptions;
  ataBalanceOptions: UseATABalanceOptions;
  ataOptions: UseAssociatedTokenAccountOptions;
  ataResult: UseAssociatedTokenAccountResult;
}

/** Providers and the contexts behind them. */
export interface ProviderTypes {
  grill: GrillProviderProps;
  headless: GrillHeadlessProviderProps;
  subscription: SubscriptionProviderProps;
  wallet: WalletProviderProps;
  grillContext: GrillContextValue;
  walletContext: WalletContextState;
}

/** WebSocket subscription plumbing. */
export interface SubscriptionTypes {
  manager: SubscriptionManager;
  decoder: AccountDecoder<Mint>;
  data: AccountData;
}

/** Cache keys. */
export interface QueryKeyTypes {
  account: AccountQueryKey;
  tokenInfo: TokenInfoQueryKey;
  pda: PdaQueryKey<{ mint: string }>;
}

/** Transaction lifecycle events. */
export interface TransactionTypes {
  id: TransactionId;
  event: TransactionStatusEvent;
  callback: TransactionStatusEventCallback;
}
