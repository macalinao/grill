import type {
  Account,
  AddressesByLookupTableAddress,
  BlockhashLifetimeConstraint,
  Instruction,
  Signature,
} from "@solana/kit";
import type { CreateTransactionInput } from "gill";
import type { TransactionConfirmationTuning } from "./confirm-transaction.js";

export interface SendTXOptions extends Pick<
  CreateTransactionInput<0>,
  "computeUnitLimit" | "computeUnitPrice"
> {
  /**
   * Address lookup tables (optional)
   */
  lookupTables?: AddressesByLookupTableAddress;
  /**
   * Whether to wait for account refetch after transaction confirmation.
   * When true (default), the function will wait for all writable accounts
   * to be refetched before resolving. When false, the function will
   * resolve immediately after confirmation and accounts will be refetched
   * in the background.
   * @default true
   */
  waitForAccountRefetch?: boolean;
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
  /**
   * Tuning for how the sent transaction is confirmed: poll cadence and
   * attempts, how often the blockhash is checked for expiry, and how a dropped
   * signature subscription is re-established.
   */
  confirmation?: TransactionConfirmationTuning;
  /**
   * Fetch the confirmed transaction after it lands and log its program logs.
   *
   * Off by default: the logs cost a `getTransaction` round trip that nothing
   * else in the send path needs. They are emitted at the `debug` level, so the
   * fetch is skipped unless the logger is set to `"debug"`.
   *
   * @default false
   */
  fetchTransactionLogs?: boolean;
}

export type SendTXFunction = (
  name: string,
  ixs: readonly Instruction[],
  options?: SendTXOptions,
) => Promise<Signature>;

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
