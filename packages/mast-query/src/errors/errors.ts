export abstract class MastError extends Error {
  abstract readonly code: string;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

export class MastAccountLoadError extends MastError {
  readonly code = "MAST_ACCOUNT_LOAD_ERROR";
  constructor(readonly accountId: string, cause?: unknown) {
    super(`Error loading account ${accountId}`, cause);
  }
}

export class MastAccountParseError extends MastError {
  readonly code = "MAST_ACCOUNT_PARSE_ERROR";
  constructor(readonly accountId: string, cause?: unknown) {
    super(`Error parsing account ${accountId}`, cause);
  }
}

export class MastProgramAccountParseError extends MastError {
  readonly code = "MAST_PROGRAM_ACCOUNT_PARSE_ERROR";
  constructor(
    readonly programId: string,
    readonly accountId: string,
    cause?: unknown,
  ) {
    super(
      `Error parsing account ${accountId} for program ${programId}`,
      cause,
    );
  }
}

export class MastGetMultipleAccountsError extends MastError {
  readonly code = "MAST_GET_MULTIPLE_ACCOUNTS_ERROR";
  constructor(cause?: unknown) {
    super("Error getting multiple accounts", cause);
  }
}

export class MastBatchFetchError extends MastError {
  readonly code = "MAST_BATCH_FETCH_ERROR";
  constructor(cause?: unknown) {
    super("Error fetching batch of accounts", cause);
  }
}

export class MastRefetchSubscriptionsError extends MastError {
  readonly code = "MAST_REFETCH_SUBSCRIPTIONS_ERROR";
  constructor(cause?: unknown) {
    super("Error refetching subscriptions", cause);
  }
}

export class MastCacheRefetchError extends MastError {
  readonly code = "MAST_CACHE_REFETCH_ERROR";
  constructor(cause?: unknown) {
    super("Error refetching cache", cause);
  }
}

export abstract class MastTransactionError extends MastError {
  abstract override readonly code: string;
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class MastTransactionSignError extends MastTransactionError {
  override readonly code = "MAST_TRANSACTION_SIGN_ERROR";
  constructor(cause?: unknown) {
    super("Error signing transaction", cause);
  }
}

export class MastSignAndConfirmError extends MastTransactionError {
  override readonly code = "MAST_SIGN_AND_CONFIRM_ERROR";
  constructor(cause?: unknown) {
    super("Error signing and confirming transaction", cause);
  }
}

export class MastUnknownTXFailError extends MastTransactionError {
  override readonly code = "MAST_UNKNOWN_TX_FAIL_ERROR";
  constructor(readonly signature: string, cause?: unknown) {
    super(`Unknown transaction failure for signature ${signature}`, cause);
  }
}

export class MastRefetchAfterTXError extends MastError {
  readonly code = "MAST_REFETCH_AFTER_TX_ERROR";
  constructor(cause?: unknown) {
    super("Error refetching after transaction", cause);
  }
}

export class InsufficientSOLError extends MastError {
  readonly code = "INSUFFICIENT_SOL_ERROR";
  constructor(
    readonly needed: bigint,
    readonly available: bigint,
  ) {
    super(
      `Insufficient SOL: needed ${needed} lamports, but only ${available} available`,
    );
  }
}