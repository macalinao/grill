import type { GetSignaturesForAssetResponse } from "../types/signatures.js";
import { describe, expect, it } from "bun:test";
import {
  dasApiAssetSignatureSchema,
  getSignaturesForAssetResponseSchema,
} from "./signatures.js";

const SIGNATURE =
  "5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2QycQcr7skRkgVaNU3rF8k3nvXqZ4mLZM1zRhaDhWbrbUKVU6Y1MZ8L";

describe("dasApiAssetSignatureSchema", () => {
  it("parses a [signature, type] tuple", () => {
    expect(
      dasApiAssetSignatureSchema.parse([SIGNATURE, "MintToCollectionV1"]),
    ).toEqual([SIGNATURE, "MintToCollectionV1"]);
  });

  it("rejects a tuple of the wrong length", () => {
    expect(() => dasApiAssetSignatureSchema.parse([SIGNATURE])).toThrow();
    expect(() =>
      dasApiAssetSignatureSchema.parse([SIGNATURE, "Transfer", "extra"]),
    ).toThrow();
  });

  it("rejects non-string members", () => {
    expect(() => dasApiAssetSignatureSchema.parse([SIGNATURE, 1])).toThrow();
  });
});

describe("getSignaturesForAssetResponseSchema", () => {
  it("parses a signatures response", () => {
    const response: GetSignaturesForAssetResponse =
      getSignaturesForAssetResponseSchema.parse({
        total: 1,
        limit: 1000,
        page: 1,
        items: [[SIGNATURE, "MintToCollectionV1"]],
      });

    expect(response.total).toBe(1);
    expect(response.page).toBe(1);
    expect(response.items[0]?.[0]).toBe(SIGNATURE);
    expect(response.items[0]?.[1]).toBe("MintToCollectionV1");
  });

  it("parses a cursor-based response", () => {
    const response = getSignaturesForAssetResponseSchema.parse({
      total: 0,
      limit: 1000,
      before: "b",
      after: "a",
      id: "asset-id",
      items: [],
    });

    expect(response.before).toBe("b");
    expect(response.after).toBe("a");
    expect(response.id).toBe("asset-id");
    expect(response.items).toEqual([]);
  });

  it("rejects a response with malformed items", () => {
    expect(() =>
      getSignaturesForAssetResponseSchema.parse({
        total: 1,
        limit: 1000,
        items: [[SIGNATURE]],
      }),
    ).toThrow();
  });

  it("rejects a response that is missing required fields", () => {
    expect(() =>
      getSignaturesForAssetResponseSchema.parse({ total: 1, limit: 1000 }),
    ).toThrow();
  });
});
