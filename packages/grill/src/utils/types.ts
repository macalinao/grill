import type {
  AddressesByLookupTableAddress,
  Instruction,
  Signature,
} from "@solana/kit";

export interface SendTXOptions {
  lookupTables?: AddressesByLookupTableAddress;
  /**
   * Compute unit limit for the transaction.
   * Set to null to omit compute unit limit instruction.
   * Defaults to 1,400,000 if not specified.
   */
  computeUnitLimit?: number | null;
  /**
   * Compute unit price for the transaction in microlamports.
   * Set to null to omit compute unit price instruction.
   * Defaults to 100,000 if not specified.
   */
  computeUnitPrice?: bigint | null;
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
