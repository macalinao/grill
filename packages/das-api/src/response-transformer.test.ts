import type { RpcRequest } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { DasApiError } from "./das-api-error.js";
import { dasApiResponseTransformer } from "./response-transformer.js";

const request: RpcRequest = { methodName: "getAsset", params: { id: "abc" } };

describe("dasApiResponseTransformer", () => {
  it("unwraps the result from a successful envelope", () => {
    const result = dasApiResponseTransformer(
      { jsonrpc: "2.0", id: 1, result: { id: "abc", burnt: false } },
      request,
    );

    expect(result).toEqual({ id: "abc", burnt: false });
  });

  it("returns falsy results as-is", () => {
    expect(
      dasApiResponseTransformer(
        { jsonrpc: "2.0", id: 1, result: null },
        request,
      ),
    ).toBeNull();
  });

  it("throws a DasApiError when the envelope carries an error", () => {
    expect(() =>
      dasApiResponseTransformer(
        {
          jsonrpc: "2.0",
          id: 1,
          error: { code: -32000, message: "Database Error", data: { foo: 1 } },
        },
        request,
      ),
    ).toThrow(DasApiError);
  });

  it("propagates the error code and message on the thrown error", () => {
    try {
      dasApiResponseTransformer(
        {
          jsonrpc: "2.0",
          id: 1,
          error: { code: -32601, message: "not found" },
        },
        request,
      );
      throw new Error("should not reach here");
    } catch (error) {
      expect(error).toBeInstanceOf(DasApiError);
      const dasError = error as DasApiError;
      expect(dasError.code).toBe(-32601);
      expect(dasError.message).toBe("not found");
    }
  });
});
