export enum TransactionErrorType {
  USER_CANCELED = "USER_CANCELED",
  TIMEOUT = "TIMEOUT",
  SIMULATION_FAILED = "SIMULATION_FAILED",
  TRANSACTION_EXPIRED = "TRANSACTION_EXPIRED",
  BLOCKHASH_NOT_FOUND = "BLOCKHASH_NOT_FOUND",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  UNKNOWN = "UNKNOWN",
}

export interface CategorizedTransactionError {
  type: TransactionErrorType;
  message: string;
  originalError: unknown;
}

export function categorizeTransactionError(
  error: unknown,
): CategorizedTransactionError {
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : String(error);

  if (errorMessage.includes("user rejected") || errorMessage.includes("user denied")) {
    return {
      type: TransactionErrorType.USER_CANCELED,
      message: "Transaction was canceled by the user",
      originalError: error,
    };
  }

  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return {
      type: TransactionErrorType.TIMEOUT,
      message: "Transaction timed out",
      originalError: error,
    };
  }

  if (errorMessage.includes("simulation failed")) {
    return {
      type: TransactionErrorType.SIMULATION_FAILED,
      message: "Transaction simulation failed",
      originalError: error,
    };
  }

  if (errorMessage.includes("transaction expired") || errorMessage.includes("blockhash expired")) {
    return {
      type: TransactionErrorType.TRANSACTION_EXPIRED,
      message: "Transaction expired - blockhash too old",
      originalError: error,
    };
  }

  if (errorMessage.includes("blockhash not found")) {
    return {
      type: TransactionErrorType.BLOCKHASH_NOT_FOUND,
      message: "Blockhash not found",
      originalError: error,
    };
  }

  if (errorMessage.includes("insufficient funds") || errorMessage.includes("insufficient lamports")) {
    return {
      type: TransactionErrorType.INSUFFICIENT_FUNDS,
      message: "Insufficient funds for transaction",
      originalError: error,
    };
  }

  return {
    type: TransactionErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : "Unknown error occurred",
    originalError: error,
  };
}