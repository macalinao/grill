import { describe, expect, it } from "bun:test";
import { defaultTokenMetadataValidator } from "./token-metadata-validator.js";

describe("defaultTokenMetadataValidator", () => {
  it("accepts metadata with the required fields", () => {
    expect(
      defaultTokenMetadataValidator({ name: "Solana", symbol: "SOL" }),
    ).toEqual({
      name: "Solana",
      symbol: "SOL",
      description: undefined,
      image: undefined,
      animation_url: undefined,
      external_url: undefined,
    });
  });

  it("passes through the well-known optional string fields", () => {
    expect(
      defaultTokenMetadataValidator({
        name: "Solana",
        symbol: "SOL",
        description: "A token",
        image: "https://example.com/sol.png",
        animation_url: "https://example.com/sol.mp4",
        external_url: "https://example.com",
      }),
    ).toEqual({
      name: "Solana",
      symbol: "SOL",
      description: "A token",
      image: "https://example.com/sol.png",
      animation_url: "https://example.com/sol.mp4",
      external_url: "https://example.com",
    });
  });

  it("drops optional fields that are not strings", () => {
    const result = defaultTokenMetadataValidator({
      name: "Solana",
      symbol: "SOL",
      image: 42,
    });
    expect(result?.image).toBeUndefined();
  });

  it("rejects payloads missing name or symbol", () => {
    expect(defaultTokenMetadataValidator({ symbol: "SOL" })).toBeNull();
    expect(defaultTokenMetadataValidator({ name: "Solana" })).toBeNull();
  });

  it("rejects payloads whose name or symbol are not strings", () => {
    expect(
      defaultTokenMetadataValidator({ name: 1, symbol: "SOL" }),
    ).toBeNull();
    expect(
      defaultTokenMetadataValidator({ name: "Solana", symbol: null }),
    ).toBeNull();
  });

  it("rejects non-object payloads", () => {
    expect(defaultTokenMetadataValidator(null)).toBeNull();
    expect(defaultTokenMetadataValidator(undefined)).toBeNull();
    expect(defaultTokenMetadataValidator("Solana")).toBeNull();
    expect(defaultTokenMetadataValidator(42)).toBeNull();
  });

  it("does not surface unvalidated nested fields", () => {
    const result = defaultTokenMetadataValidator({
      name: "Solana",
      symbol: "SOL",
      attributes: "not-an-array",
      collection: 12345,
    });
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty("attributes");
    expect(result).not.toHaveProperty("collection");
  });
});
