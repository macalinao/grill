export abstract class KiteError extends Error {
  abstract readonly code: string;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

export class KiteAccountLoadError extends KiteError {
  readonly code = "KITE_ACCOUNT_LOAD_ERROR";
  constructor(readonly accountId: string, cause?: unknown) {
    super(`Error loading account ${accountId}`, cause);
  }
}

export class KiteAccountParseError extends KiteError {
  readonly code = "KITE_ACCOUNT_PARSE_ERROR";
  constructor(readonly accountId: string, cause?: unknown) {
    super(`Error parsing account ${accountId}`, cause);
  }
}

export class KiteProgramAccountParseError extends KiteError {
  readonly code = "KITE_PROGRAM_ACCOUNT_PARSE_ERROR";
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

export class KiteGetMultipleAccountsError extends KiteError {
  readonly code = "KITE_GET_MULTIPLE_ACCOUNTS_ERROR";
  constructor(cause?: unknown) {
    super("Error getting multiple accounts", cause);
  }
}

export class KiteBatchFetchError extends KiteError {
  readonly code = "KITE_BATCH_FETCH_ERROR";
  constructor(cause?: unknown) {
    super("Error fetching batch of accounts", cause);
  }
}

export class KiteRefetchSubscriptionsError extends KiteError {
  readonly code = "KITE_REFETCH_SUBSCRIPTIONS_ERROR";
  constructor(cause?: unknown) {
    super("Error refetching subscriptions", cause);
  }
}

export class KiteCacheRefetchError extends KiteError {
  readonly code = "KITE_CACHE_REFETCH_ERROR";
  constructor(cause?: unknown) {
    super("Error refetching cache", cause);
  }
}

export class KiteTransactionError extends KiteError {
  readonly code = "KITE_TRANSACTION_ERROR";
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class KiteTransactionSignError extends KiteTransactionError {
  readonly code = "KITE_TRANSACTION_SIGN_ERROR";
  constructor(cause?: unknown) {
    super("Error signing transaction", cause);
  }
}

export class KiteSignAndConfirmError extends KiteTransactionError {
  readonly code = "KITE_SIGN_AND_CONFIRM_ERROR";
  constructor(cause?: unknown) {
    super("Error signing and confirming transaction", cause);
  }
}

export class KiteUnknownTXFailError extends KiteTransactionError {
  readonly code = "KITE_UNKNOWN_TX_FAIL_ERROR";
  constructor(readonly signature: string, cause?: unknown) {
    super(`Unknown transaction failure for signature ${signature}`, cause);
  }
}

export class KiteRefetchAfterTXError extends KiteError {
  readonly code = "KITE_REFETCH_AFTER_TX_ERROR";
  constructor(cause?: unknown) {
    super("Error refetching after transaction", cause);
  }
}

export class InsufficientSOLError extends KiteError {
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