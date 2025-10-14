import type { TransactionError } from "@solana/kit";
import { getSolanaErrorFromTransactionError } from "@solana/kit";

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

  const solanaError = getSolanaErrorFromTransactionError(err);
  return solanaError.message;
};
