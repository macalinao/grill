import type {
  DasApiAssetInterface,
  DasApiAuthorityScope,
  DasApiOwnershipModel,
  DasApiPropGroupKey,
  DasApiRoyaltyModel,
  DasApiUseMethod,
} from "../types/common.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import {
  compressionHashSchema,
  dasApiAssetInterfaceSchema,
  dasApiAuthorityScopeSchema,
  dasApiOwnershipModelSchema,
  dasApiPropGroupKeySchema,
  dasApiRoyaltyModelSchema,
  dasApiUseMethodSchema,
} from "./common.js";

describe("dasApiAssetInterfaceSchema", () => {
  it("accepts every known interface", () => {
    const interfaces: DasApiAssetInterface[] = [
      "V1_NFT",
      "V1_PRINT",
      "LEGACY_NFT",
      "V2_NFT",
      "FungibleAsset",
      "FungibleToken",
      "Custom",
      "Identity",
      "Executable",
      "ProgrammableNFT",
      "MplCoreAsset",
      "MplCoreCollection",
    ];

    for (const value of interfaces) {
      expect(dasApiAssetInterfaceSchema.parse(value)).toBe(value);
    }
  });

  it("rejects an unknown interface", () => {
    expect(() => dasApiAssetInterfaceSchema.parse("V3_NFT")).toThrow();
  });
});

describe("dasApiAuthorityScopeSchema", () => {
  it("accepts every known scope", () => {
    const scopes: DasApiAuthorityScope[] = [
      "full",
      "royalty",
      "metadata",
      "extension",
    ];

    for (const value of scopes) {
      expect(dasApiAuthorityScopeSchema.parse(value)).toBe(value);
    }
  });

  it("rejects an unknown scope", () => {
    expect(() => dasApiAuthorityScopeSchema.parse("partial")).toThrow();
  });
});

describe("dasApiPropGroupKeySchema", () => {
  it("accepts the collection group key", () => {
    const groupKey: DasApiPropGroupKey =
      dasApiPropGroupKeySchema.parse("collection");

    expect(groupKey).toBe("collection");
  });

  it("rejects an unknown group key", () => {
    expect(() => dasApiPropGroupKeySchema.parse("family")).toThrow();
  });
});

describe("dasApiOwnershipModelSchema", () => {
  it("accepts every known ownership model", () => {
    const models: DasApiOwnershipModel[] = ["single", "token"];

    for (const value of models) {
      expect(dasApiOwnershipModelSchema.parse(value)).toBe(value);
    }
  });

  it("rejects an unknown ownership model", () => {
    expect(() => dasApiOwnershipModelSchema.parse("shared")).toThrow();
  });
});

describe("dasApiRoyaltyModelSchema", () => {
  it("accepts every known royalty model", () => {
    const models: DasApiRoyaltyModel[] = ["creators", "fanout", "single"];

    for (const value of models) {
      expect(dasApiRoyaltyModelSchema.parse(value)).toBe(value);
    }
  });

  it("rejects an unknown royalty model", () => {
    expect(() => dasApiRoyaltyModelSchema.parse("none")).toThrow();
  });
});

describe("dasApiUseMethodSchema", () => {
  it("accepts every known use method", () => {
    const methods: DasApiUseMethod[] = ["burn", "multiple", "single"];

    for (const value of methods) {
      expect(dasApiUseMethodSchema.parse(value)).toBe(value);
    }
  });

  it("rejects an unknown use method", () => {
    expect(() => dasApiUseMethodSchema.parse("reuse")).toThrow();
  });
});

describe("compressionHashSchema", () => {
  it("parses a base58 hash into an Address", () => {
    const hash = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    expect(compressionHashSchema.parse(hash)).toBe(address(hash));
  });

  it("passes through the empty string returned for uncompressed assets", () => {
    // Indexers return "" for data_hash/creator_hash/asset_hash/tree on assets
    // that are not compressed; rejecting those would reject every regular NFT.
    expect(compressionHashSchema.parse("") as string).toBe("");
  });

  it("rejects a non-empty value that is not a valid base58 hash", () => {
    expect(() => compressionHashSchema.parse("not-a-hash")).toThrow();
  });

  it("rejects non-string values", () => {
    expect(() => compressionHashSchema.parse(null)).toThrow();
    expect(() => compressionHashSchema.parse(42)).toThrow();
  });
});
