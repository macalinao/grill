import type {
  Address,
  Instruction,
  TransactionMessage,
  TransactionMessageWithBlockhashLifetime,
  TransactionMessageWithFeePayer,
  TransactionMessageWithFeePayerSigner,
  TransactionSigner,
  TransactionVersion,
} from "@solana/kit";
import type { Simplify } from "./simplify.js";
import {
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
} from "@solana-program/compute-budget";
import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  isTransactionSigner,
  setTransactionMessageFeePayer,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";

/**
 * Input accepted by {@link createTransaction}.
 */
export interface CreateTransactionInput<
  TVersion extends TransactionVersion | "auto",
  TFeePayer extends Address | TransactionSigner = TransactionSigner,
  TLifetimeConstraint extends
    | TransactionMessageWithBlockhashLifetime["lifetimeConstraint"]
    | undefined = undefined,
> {
  /** Compute unit limit value to set on this transaction */
  computeUnitLimit?: bigint | number;
  /** Compute unit price (in micro-lamports) to set on this transaction */
  computeUnitPrice?: bigint | number;
  /** Address or Signer that will pay transaction fees */
  feePayer: TFeePayer;
  /** List of instructions for this transaction */
  instructions: Instruction[];
  /**
   * Latest blockhash (aka transaction lifetime) for this transaction to be
   * accepted for execution on the Solana network
   */
  latestBlockhash?: TLifetimeConstraint;
  /**
   * Transaction version
   * - `auto` automatically selects based on instruction content (default)
   * - `legacy` for traditional transactions
   * - `0` for transactions using Address Lookup Tables
   *
   * @default `auto`
   */
  version?: TVersion;
}

/**
 * A transaction message with a fee payer, and optionally a blockhash lifetime.
 */
export type FullTransaction<
  TVersion extends TransactionVersion,
  TFeePayer extends
    | TransactionMessageWithFeePayer
    | TransactionMessageWithFeePayerSigner,
  TBlockhashLifetime extends
    | TransactionMessageWithBlockhashLifetime
    | undefined = undefined,
> = Simplify<
  Extract<TransactionMessage, { version: TVersion }> &
    TFeePayer &
    (TBlockhashLifetime extends TransactionMessageWithBlockhashLifetime
      ? TransactionMessageWithBlockhashLifetime
      : object)
>;

/**
 * Whether an instruction appears to reference an Address Lookup Table, which
 * forces a versioned (`0`) transaction.
 */
const usesAddressLookupTable = (instruction: Instruction): boolean => {
  if ("addressTableLookup" in instruction) {
    const lookup: unknown = instruction.addressTableLookup;
    if (lookup !== undefined && lookup !== null) {
      return true;
    }
  }
  if ("addressTableLookups" in instruction) {
    const lookups: unknown = instruction.addressTableLookups;
    return Array.isArray(lookups) && (lookups as unknown[]).length > 0;
  }
  return false;
};

/**
 * Simple interface for creating a Solana transaction.
 */
export function createTransaction<
  TVersion extends TransactionVersion | "auto",
  TFeePayer extends TransactionSigner,
>(
  props: CreateTransactionInput<TVersion, TFeePayer>,
): FullTransaction<
  TVersion extends "auto" ? TransactionVersion : TVersion,
  TransactionMessageWithFeePayerSigner
>;
export function createTransaction<
  TVersion extends TransactionVersion | "auto",
  TFeePayer extends Address,
>(
  props: CreateTransactionInput<TVersion, TFeePayer>,
): FullTransaction<
  TVersion extends "auto" ? TransactionVersion : TVersion,
  TransactionMessageWithFeePayer
>;
export function createTransaction<
  TVersion extends TransactionVersion | "auto",
  TFeePayer extends TransactionSigner,
  TLifetimeConstraint extends
    TransactionMessageWithBlockhashLifetime["lifetimeConstraint"],
>(
  props: CreateTransactionInput<TVersion, TFeePayer, TLifetimeConstraint>,
): Simplify<
  FullTransaction<
    TVersion extends "auto" ? TransactionVersion : TVersion,
    TransactionMessageWithFeePayerSigner,
    TransactionMessageWithBlockhashLifetime
  >
>;
export function createTransaction<
  TVersion extends TransactionVersion | "auto",
  TFeePayer extends Address,
  TLifetimeConstraint extends
    TransactionMessageWithBlockhashLifetime["lifetimeConstraint"],
>(
  props: CreateTransactionInput<TVersion, TFeePayer, TLifetimeConstraint>,
): Simplify<
  FullTransaction<
    TVersion extends "auto" ? TransactionVersion : TVersion,
    TransactionMessageWithFeePayer,
    TransactionMessageWithBlockhashLifetime
  >
>;
export function createTransaction<
  TVersion extends TransactionVersion | "auto",
  TFeePayer extends Address | TransactionSigner,
  TLifetimeConstraint extends
    TransactionMessageWithBlockhashLifetime["lifetimeConstraint"],
>(
  props: CreateTransactionInput<TVersion, TFeePayer, TLifetimeConstraint>,
): Simplify<
  FullTransaction<
    TVersion extends "auto" ? TransactionVersion : TVersion,
    TransactionMessageWithFeePayer,
    TransactionMessageWithBlockhashLifetime
  >
>;
export function createTransaction({
  version,
  feePayer,
  instructions,
  latestBlockhash,
  computeUnitLimit,
  computeUnitPrice,
}: CreateTransactionInput<
  TransactionVersion | "auto",
  Address | TransactionSigner,
  TransactionMessageWithBlockhashLifetime["lifetimeConstraint"] | undefined
>): TransactionMessage &
  TransactionMessageWithBlockhashLifetime &
  TransactionMessageWithFeePayerSigner {
  // Auto-select version: if any provided instruction appears to use an Address
  // Lookup Table (ALT), choose `0`. Otherwise default to `legacy`. If the
  // caller explicitly provides `version`, use it.
  const selectedVersion =
    version === undefined || version === "auto"
      ? instructions.some(usesAddressLookupTable)
        ? 0
        : "legacy"
      : version;

  const empty = createTransactionMessage({ version: selectedVersion });

  const withLifetime = latestBlockhash
    ? setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, empty)
    : empty;

  const withFeePayer =
    typeof feePayer !== "string" && isTransactionSigner(feePayer)
      ? setTransactionMessageFeePayerSigner(feePayer, withLifetime)
      : setTransactionMessageFeePayer(feePayer, withLifetime);

  const withComputeLimit =
    computeUnitLimit === undefined
      ? withFeePayer
      : appendTransactionMessageInstruction(
          getSetComputeUnitLimitInstruction({
            units: Number(computeUnitLimit),
          }),
          withFeePayer,
        );

  const withComputePrice =
    computeUnitPrice === undefined
      ? withComputeLimit
      : appendTransactionMessageInstruction(
          getSetComputeUnitPriceInstruction({
            microLamports: Number(computeUnitPrice),
          }),
          withComputeLimit,
        );

  // The implementation signature is deliberately the narrowest shape every
  // overload's return type accepts; which of them a caller actually gets is
  // decided by the overload they matched.
  return appendTransactionMessageInstructions(
    instructions,
    withComputePrice,
  ) as TransactionMessage &
    TransactionMessageWithBlockhashLifetime &
    TransactionMessageWithFeePayerSigner;
}
