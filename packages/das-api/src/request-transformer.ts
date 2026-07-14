import type { RpcRequest, RpcRequestTransformer } from "@solana/kit";
import type { JsonValue } from "./types/json-value.js";

/**
 * Transforms an RPC request so that its wire `params` is the single method
 * argument object rather than an array of arguments.
 *
 * `@solana/kit` collects a method's call arguments into an array, producing a
 * JSON-RPC payload with `params: [input]`. The DAS API, however, expects named
 * parameters: `params: input`. This transformer unwraps the first (and only)
 * argument so the wire payload matches what DAS endpoints expect. Methods called
 * with no argument fall back to an empty object.
 *
 * DAS method arguments are always JSON-serializable, so the raw params are
 * treated as a {@link JsonValue} array.
 */
export const dasApiRequestTransformer: RpcRequestTransformer = <TParams>(
  request: RpcRequest<TParams>,
): RpcRequest => {
  const params = request.params as JsonValue[];
  return {
    ...request,
    params: params.length > 0 ? params[0] : {},
  };
};
