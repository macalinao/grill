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
  appendTransactionMessageInstructions,
  createTransactionMessage,
  isTransactionSigner,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessageComputeUnitPrice,
  setTransactionMessageFeePayer,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  setTransactionMessageLoadedAccountsDataSizeLimit,
  setTransactionMessagePriorityFeeLamports,
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
  /**
   * Compute unit limit to set on this transaction.
   *
   * - Legacy / `0`: added as a `SetComputeUnitLimit` Compute Budget
   *   instruction. When omitted, the runtime default (200,000 CUs per
   *   instruction) applies.
   * - `1`: written to the message's `config.computeUnitLimit`. **Required** --
   *   a v1 transaction without a limit is budgeted zero compute units, so
   *   {@link createTransaction} throws when it is missing.
   */
  computeUnitLimit?: bigint | number;
  /**
   * Compute unit price (in micro-lamports per compute unit) to set on this
   * transaction, added as a `SetComputeUnitPrice` Compute Budget instruction.
   *
   * Only valid for legacy and `0` transactions; v1 transactions pay a total
   * {@link CreateTransactionInput.priorityFeeLamports} instead, and passing
   * this with version `1` throws.
   */
  computeUnitPrice?: bigint | number;
  /**
   * Total priority fee, in lamports, to pay for this transaction. Written to
   * the message's `config.priorityFeeLamports`.
   *
   * Only valid for v1 transactions; legacy and `0` transactions use
   * {@link CreateTransactionInput.computeUnitPrice} instead, and passing this
   * with any other version throws.
   */
  priorityFeeLamports?: bigint | number;
  /**
   * Maximum size, in bytes, of account data the transaction may load.
   *
   * - Legacy / `0`: added as a `SetLoadedAccountsDataSizeLimit` Compute Budget
   *   instruction. Optional; the runtime default applies when omitted.
   * - `1`: written to the message's `config.loadedAccountsDataSizeLimit`.
   *   **Required** -- a v1 transaction without it is budgeted zero bytes of
   *   loaded account data, so {@link createTransaction} throws when it is
   *   missing.
   */
  loadedAccountsDataSizeLimit?: bigint | number;
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
   * - `1` for v1 transactions, which carry their compute budget in the
   *   message config instead of Compute Budget instructions. v1 requires
   *   `computeUnitLimit` and `loadedAccountsDataSizeLimit`, and does not
   *   support Address Lookup Tables, so `auto` never selects it.
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
 *
 * Compute budget options are applied with kit's version-aware setters: legacy
 * and `0` transactions get Compute Budget instructions (placed before
 * `instructions`), while v1 transactions get the equivalent fields in the
 * message's `config`.
 *
 * @throws if version `1` is used without `computeUnitLimit` or
 *   `loadedAccountsDataSizeLimit`, if `computeUnitPrice` is used with version
 *   `1`, or if `priorityFeeLamports` is used with a legacy or `0` transaction.
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
  priorityFeeLamports,
  loadedAccountsDataSizeLimit,
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

  if (selectedVersion === 1) {
    if (computeUnitLimit === undefined) {
      throw new Error(
        "createTransaction: version 1 transactions require `computeUnitLimit`; without it the transaction is budgeted zero compute units and fails at execution.",
      );
    }
    if (loadedAccountsDataSizeLimit === undefined) {
      throw new Error(
        "createTransaction: version 1 transactions require `loadedAccountsDataSizeLimit`; without it the transaction is budgeted zero bytes of loaded account data and fails at execution.",
      );
    }
    if (computeUnitPrice !== undefined) {
      throw new Error(
        "createTransaction: `computeUnitPrice` is not supported for version 1 transactions; use `priorityFeeLamports` (the total priority fee in lamports) instead.",
      );
    }
  } else if (priorityFeeLamports !== undefined) {
    throw new Error(
      `createTransaction: \`priorityFeeLamports\` is only supported for version 1 transactions (got version ${String(selectedVersion)}); use \`computeUnitPrice\` (micro-lamports per compute unit) instead.`,
    );
  }

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
      : setTransactionMessageComputeUnitLimit(
          Number(computeUnitLimit),
          withFeePayer,
        );

  // `version` is a runtime value here, so TypeScript cannot narrow the
  // message type from it; the version-specific setters are called on the
  // message re-typed to the version that was just checked.
  type Message = typeof withComputeLimit;
  const withPriorityFee: Message =
    withComputeLimit.version === 1
      ? priorityFeeLamports === undefined
        ? withComputeLimit
        : setTransactionMessagePriorityFeeLamports(
            BigInt(priorityFeeLamports),
            withComputeLimit as Message & { version: 1 },
          )
      : computeUnitPrice === undefined
        ? withComputeLimit
        : setTransactionMessageComputeUnitPrice(
            BigInt(computeUnitPrice),
            withComputeLimit as Message & { version: "legacy" | 0 },
          );

  const withDataSizeLimit =
    loadedAccountsDataSizeLimit === undefined
      ? withPriorityFee
      : setTransactionMessageLoadedAccountsDataSizeLimit(
          Number(loadedAccountsDataSizeLimit),
          withPriorityFee,
        );

  // The implementation signature is deliberately the narrowest shape every
  // overload's return type accepts; which of them a caller actually gets is
  // decided by the overload they matched.
  return appendTransactionMessageInstructions(
    instructions,
    withDataSizeLimit,
  ) as TransactionMessage &
    TransactionMessageWithBlockhashLifetime &
    TransactionMessageWithFeePayerSigner;
}
