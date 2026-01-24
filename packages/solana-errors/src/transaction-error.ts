/**
 * Solana TransactionError message mappings.
 * These messages are based on the official Solana SDK:
 * https://docs.rs/solana-sdk/latest/solana_sdk/transaction/enum.TransactionError.html
 */

import type { TransactionError } from "@solana/kit";
import { getInstructionErrorMessage } from "./instruction-error.js";

export type { TransactionError };

/**
 * TransactionError variant names mapped to their human-readable messages.
 */
export const TRANSACTION_ERROR_MESSAGES: Record<string, string> = {
  AccountInUse: "Account is already being processed in another transaction",
  AccountLoadedTwice: "Account loaded twice",
  AccountNotFound: "Attempt to debit an account but found no record of a prior credit",
  ProgramAccountNotFound: "Attempt to load a program that does not exist",
  InsufficientFundsForFee:
    "Insufficient funds for fee",
  InvalidAccountForFee:
    "This account may not be used to pay transaction fees",
  AlreadyProcessed: "This transaction has already been processed",
  BlockhashNotFound:
    "Blockhash not found in recent blockhashes or in the blockhash queue",
  CallChainTooDeep: "Loader call chain is too deep",
  MissingSignatureForFee:
    "Transaction requires a fee but has no signature present",
  InvalidAccountIndex: "Transaction contains an invalid account reference",
  SignatureFailure: "Transaction signature verification failure",
  InvalidProgramForExecution:
    "Program specified in the transaction is not a valid program",
  SanitizeFailure: "Transaction failed to sanitize accounts offsets correctly",
  ClusterMaintenance:
    "Transactions are currently disabled due to cluster maintenance",
  AccountBorrowOutstanding:
    "Transaction processing left an account with an outstanding borrowed reference",
  WouldExceedMaxBlockCostLimit:
    "Transaction would exceed max block cost limit",
  UnsupportedVersion: "Transaction version is unsupported",
  InvalidWritableAccount: "Transaction loads a writable account that cannot be written",
  WouldExceedMaxAccountCostLimit:
    "Transaction would exceed max account limit within the block",
  WouldExceedAccountDataBlockLimit:
    "Transaction would exceed account data block limit",
  TooManyAccountLocks:
    "Transaction locked too many accounts",
  AddressLookupTableNotFound: "Address lookup table not found",
  InvalidAddressLookupTableOwner:
    "Attempted to lookup addresses from an account owned by the wrong program",
  InvalidAddressLookupTableData:
    "Attempted to lookup addresses from an invalid account",
  InvalidAddressLookupTableIndex:
    "Address table lookup uses an invalid index",
  InvalidRentPayingAccount:
    "Transaction leaves an account with a lower balance than rent-exempt minimum",
  WouldExceedMaxVoteCostLimit:
    "Transaction would exceed max vote cost limit",
  WouldExceedAccountDataTotalLimit:
    "Transaction would exceed account data total limit",
  MaxLoadedAccountsDataSizeExceeded:
    "Transaction results in an account exceeding the maximum size of loaded accounts data",
  InvalidLoadedAccountsDataSizeLimit:
    "LoadedAccountsDataSizeLimit set for transaction must be greater than 0",
  ResanitizationNeeded: "Transaction requires re-sanitization",
  ProgramExecutionTemporarilyRestricted:
    "Program execution temporarily restricted",
  UnbalancedTransaction: "Sum of account balances before and after transaction do not match",
};

/**
 * Gets the human-readable message for a TransactionError.
 *
 * @param error - The TransactionError value from the RPC response
 * @returns The formatted error message
 */
export function getTransactionErrorMessage(error: TransactionError): string {
  if (error === null || error === undefined) {
    return "Unknown transaction error";
  }

  // Handle string error (simple variant like "AccountInUse")
  if (typeof error === "string") {
    return (
      TRANSACTION_ERROR_MESSAGES[error] ?? `Transaction error: ${error}`
    );
  }

  // Handle object error (variant with data)
  if (typeof error === "object") {
    const entries = Object.entries(error);
    if (entries.length === 0) {
      return "Unknown transaction error";
    }

    const [variant, value] = entries[0];

    // Special case for InstructionError
    if (variant === "InstructionError" && Array.isArray(value)) {
      const [instructionIndex, instructionError] = value;
      const instructionMessage = getInstructionErrorMessage(instructionError);
      return `Instruction ${instructionIndex} failed: ${instructionMessage}`;
    }

    // Special case for DuplicateInstruction
    if (variant === "DuplicateInstruction" && typeof value === "number") {
      return `Transaction contains a duplicate instruction at index ${value}`;
    }

    // Special case for InsufficientFundsForRent
    if (
      variant === "InsufficientFundsForRent" &&
      typeof value === "object" &&
      value !== null &&
      "account_index" in value
    ) {
      const accountIndex = (value as { account_index: number }).account_index;
      return `Account at index ${accountIndex} has insufficient funds for rent`;
    }

    // Special case for ProgramExecutionTemporarilyRestricted
    if (
      variant === "ProgramExecutionTemporarilyRestricted" &&
      typeof value === "object" &&
      value !== null &&
      "account_index" in value
    ) {
      const accountIndex = (value as { account_index: number }).account_index;
      return `Program execution temporarily restricted for account at index ${accountIndex}`;
    }

    // For other variants
    const baseMessage =
      TRANSACTION_ERROR_MESSAGES[variant] ?? `Transaction error: ${variant}`;
    if (value !== null && value !== undefined && value !== true) {
      return `${baseMessage}: ${JSON.stringify(value)}`;
    }
    return baseMessage;
  }

  return `Unknown transaction error: ${String(error)}`;
}
