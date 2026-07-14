/**
 * @macalinao/solana-errors
 *
 * Solana error message formatting that works in production.
 *
 * Unlike @solana/errors which strips error messages in production builds
 * (when __DEV__ is false), this package always includes the full error messages.
 * This is useful for displaying user-friendly error messages in production
 * applications.
 */

export {
  getInstructionErrorMessage,
  INSTRUCTION_ERROR_MESSAGES,
} from "./instruction-error.js";
export {
  getTransactionErrorMessage,
  TRANSACTION_ERROR_MESSAGES,
  type TransactionError,
} from "./transaction-error.js";
