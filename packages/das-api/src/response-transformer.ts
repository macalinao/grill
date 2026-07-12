import type { RpcResponse, RpcResponseTransformer } from "@solana/kit";
import type { DasApiErrorObject } from "./das-api-error.js";
import type { JsonValue } from "./types/json-value.js";
import { DasApiError } from "./das-api-error.js";

interface JsonRpcResponseBody {
  result?: JsonValue;
  error?: DasApiErrorObject;
}

/**
 * Transforms a raw JSON-RPC response body into the method result.
 *
 * The default `@solana/kit` HTTP transport resolves to the full JSON-RPC
 * envelope (`{ jsonrpc, id, result }` or `{ jsonrpc, id, error }`). This
 * transformer throws a {@link DasApiError} when the envelope carries an `error`,
 * and otherwise unwraps and returns the `result`.
 */
export const dasApiResponseTransformer: RpcResponseTransformer = (
  response: RpcResponse,
): RpcResponse => {
  const body = response as JsonRpcResponseBody;
  if (body.error) {
    throw new DasApiError(body.error);
  }
  return body.result;
};
