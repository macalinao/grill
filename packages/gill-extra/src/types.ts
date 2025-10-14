import type {
  Account,
  AddressesByLookupTableAddress,
  Instruction,
  Signature,
} from "@solana/kit";
import type { CreateTransactionInput } from "gill";

export interface SendTXOptions
  extends Pick<
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
