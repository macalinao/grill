import { describe, expect, it } from "bun:test";
import * as dasApi from "./index.js";

describe("index", () => {
  it("re-exports the public runtime surface", () => {
    expect(typeof dasApi.createDasApi).toBe("function");
    expect(typeof dasApi.createDasRpc).toBe("function");
    expect(typeof dasApi.createDasRpcFromTransport).toBe("function");
    expect(typeof dasApi.dasApiRequestTransformer).toBe("function");
    expect(typeof dasApi.dasApiResponseTransformer).toBe("function");
    expect(typeof dasApi.DasApiError).toBe("function");
  });

  it("createDasApi exposes every DAS method", () => {
    const api = dasApi.createDasApi();
    for (const method of [
      "getAsset",
      "getAssetBatch",
      "getAssetProof",
      "getAssetProofBatch",
      "getAssetsByOwner",
      "getAssetsByAuthority",
      "getAssetsByCreator",
      "getAssetsByGroup",
      "searchAssets",
      "getSignaturesForAsset",
      "getTokenAccounts",
      "getNftEditions",
    ] as const) {
      expect(typeof api[method]).toBe("function");
    }
  });
});
