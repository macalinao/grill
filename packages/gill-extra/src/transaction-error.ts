import type { TransactionError } from "@solana/kit";
import { getTransactionErrorMessage } from "@macalinao/solana-errors";

export const parseTransactionError = (
  err: TransactionError,
  logs: string[] | null,
): string => {
  // First, try to extract Anchor error from logs
  const anchorError = [...(logs ?? [])]
    .reverse()
    .find((log) => log.includes("AnchorError"));

  if (anchorError) {
    const errorMessageStart = anchorError.indexOf("Error Message: ");
    if (errorMessageStart !== -1) {
      return anchorError.slice(errorMessageStart + 15).trim();
    }
  }

  // Use @macalinao/solana-errors for formatting - this works in production
  // unlike @solana/kit's getSolanaErrorFromTransactionError which strips
  // error messages when __DEV__ is false
  return getTransactionErrorMessage(err);
};
