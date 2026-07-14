/**
 * The shape of a JSON-RPC error object returned by a DAS API endpoint.
 */
export interface DasApiErrorObject {
  /** The JSON-RPC error code. */
  code: number;
  /** The human-readable error message. */
  message: string;
  /** Optional, provider-specific error data. */
  data?: unknown;
}

/**
 * An error thrown when a DAS API request returns a JSON-RPC error.
 */
export class DasApiError extends Error {
  /** The JSON-RPC error code. */
  readonly code: number;
  /** The provider-specific error data, if any. */
  readonly data: unknown;

  constructor(error: DasApiErrorObject) {
    super(error.message);
    this.name = "DasApiError";
    this.code = error.code;
    this.data = error.data;
  }
}
