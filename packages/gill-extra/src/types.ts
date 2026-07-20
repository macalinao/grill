import type {
  Account,
  AddressesByLookupTableAddress,
  BlockhashLifetimeConstraint,
  Instruction,
  Signature,
  Transaction,
} from "@solana/kit";
import type { CreateTransactionInput } from "gill";

/**
 * Options shared by both signing and sending a transaction: how the
 * transaction message is built and simulated.
 */
export interface BuildTXOptions extends Pick<
  CreateTransactionInput<0>,
  "computeUnitLimit" | "computeUnitPrice"
> {
  /**
   * Address lookup tables (optional)
   */
  lookupTables?: AddressesByLookupTableAddress;
  /**
   * If true, skips the pre-flight simulation.
   */
  skipPreflight?: boolean;
  /**
   * A pre-fetched blockhash to use for the transaction. When provided, the
   * transaction is built with this blockhash instead of fetching a fresh one
   * via `rpc.getLatestBlockhash()`. Useful when a caller maintains its own
   * up-to-date blockhash (e.g. a background poll/cache) to avoid an RPC round
   * trip on every transaction. When omitted, the latest blockhash is fetched.
   */
  latestBlockhash?: BlockhashLifetimeConstraint;
}

export interface SendTXOptions extends BuildTXOptions {
  /**
   * Whether to wait for account refetch after transaction confirmation.
   * When true (default), the function will wait for all writable accounts
   * to be refetched before resolving. When false, the function will
   * resolve immediately after confirmation and accounts will be refetched
   * in the background.
   * @default true
   */
  waitForAccountRefetch?: boolean;
}

export type SendTXFunction = (
  name: string,
  ixs: readonly Instruction[],
  options?: SendTXOptions,
) => Promise<Signature>;

/**
 * Options for signing a transaction without sending it.
 */
export type SignTXOptions = BuildTXOptions;

/**
 * Signs a transaction without broadcasting it, returning the fully-signed
 * {@link Transaction}. Requires that the connected signer supports signing
 * without sending (a `TransactionPartialSigner`).
 */
export type SignTXFunction = (
  name: string,
  ixs: readonly Instruction[],
  options?: SignTXOptions,
) => Promise<Transaction>;

/**
 * Simplified account type that only includes data and address.
 * Useful for functions that don't need the full account type.
 */
export type AccountInfo<TData extends Uint8Array | object> = Pick<
  Account<TData>,
  "data" | "address"
>;

/**
 * A function that computes a PDA from some arguments.
 */
export type PdaFn<TArgs, TResult> = (
  args: TArgs,
) => Promise<readonly [TResult, number]>;
