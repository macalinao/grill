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
}

export type SendTXFunction = (
  name: string,
  ixs: readonly Instruction[],
  options?: SendTXOptions,
) => Promise<Signature>;
