import type { RpcRequest } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { dasApiRequestTransformer } from "./request-transformer.js";

describe("dasApiRequestTransformer", () => {
  it("unwraps the single argument into the params object", () => {
    const request: RpcRequest<unknown[]> = {
      methodName: "getAsset",
      params: [{ id: "abc" }],
    };

    const result = dasApiRequestTransformer(request);

    expect(result.methodName).toBe("getAsset");
    expect(result.params).toEqual({ id: "abc" });
  });

  it("preserves the method name", () => {
    const request: RpcRequest<unknown[]> = {
      methodName: "searchAssets",
      params: [{ ownerAddress: "owner", page: 1 }],
    };

    const result = dasApiRequestTransformer(request);

    expect(result.methodName).toBe("searchAssets");
    expect(result.params).toEqual({ ownerAddress: "owner", page: 1 });
  });

  it("falls back to an empty object when called with no arguments", () => {
    const request: RpcRequest<unknown[]> = {
      methodName: "getAsset",
      params: [],
    };

    const result = dasApiRequestTransformer(request);

    expect(result.params).toEqual({});
  });
});
