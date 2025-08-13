import { beforeAll, describe, expect, test } from "bun:test";
import { tokenMetadataSchema } from "./token-metadata-schema.js";

// USDC metadata fixture - fetched from the actual URI
let usdcMetadata: unknown;

beforeAll(async () => {
  // USDC Metadata URI from Solana mainnet
  // USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  // Metadata URI: https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png
  // Note: The actual metadata JSON is at: https://raw.githubusercontent.com/circle-fin/solana-usdc/master/metadata/usdc.json

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/circle-fin/solana-usdc/master/metadata/usdc.json",
    );
    if (response.ok) {
      usdcMetadata = await response.json();
    } else {
      // Fallback to a mock if fetch fails
      usdcMetadata = {
        name: "USD Coin",
        symbol: "USDC",
        description: "USD Coin is a fully collateralized US dollar stablecoin",
        image:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      };
    }
  } catch {
    // Fallback to a mock if fetch fails
    usdcMetadata = {
      name: "USD Coin",
      symbol: "USDC",
      description: "USD Coin is a fully collateralized US dollar stablecoin",
      image:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    };
  }
});

describe("tokenMetadataSchema", () => {
  test("should validate USDC metadata", () => {
    const result = tokenMetadataSchema.safeParse(usdcMetadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("USD Coin");
      expect(result.data.symbol).toBe("USDC");
      expect(result.data.image).toBeDefined();
    }
  });

  test("should validate minimal metadata", () => {
    const minimalMetadata = {
      name: "Test Token",
      symbol: "TEST",
    };
    const result = tokenMetadataSchema.safeParse(minimalMetadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test Token");
      expect(result.data.symbol).toBe("TEST");
    }
  });

  test("should validate metadata with attributes", () => {
    const metadataWithAttributes = {
      name: "NFT Token",
      symbol: "NFT",
      description: "An NFT with attributes",
      image: "https://example.com/image.png",
      attributes: [
        { trait_type: "Background", value: "Blue" },
        { trait_type: "Level", value: 5 },
        { trait_type: "Speed", value: 100, display_type: "boost_number" },
      ],
    };
    const result = tokenMetadataSchema.safeParse(metadataWithAttributes);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.attributes).toHaveLength(3);
      expect(result.data.attributes?.[0]?.trait_type).toBe("Background");
      expect(result.data.attributes?.[1]?.value).toBe(5);
    }
  });

  test("should validate metadata with properties", () => {
    const metadataWithProperties = {
      name: "Collection Token",
      symbol: "COLL",
      properties: {
        files: [
          { uri: "https://example.com/file1.mp4", type: "video/mp4" },
          {
            uri: "https://example.com/file2.glb",
            type: "model/gltf-binary",
            cdn: true,
          },
        ],
        category: "video",
        creators: [{ address: "11111111111111111111111111111111", share: 100 }],
      },
    };
    const result = tokenMetadataSchema.safeParse(metadataWithProperties);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.properties?.files).toHaveLength(2);
      expect(result.data.properties?.category).toBe("video");
      expect(result.data.properties?.creators?.[0]?.share).toBe(100);
    }
  });

  test("should validate metadata with collection", () => {
    const metadataWithCollection = {
      name: "Collection Item",
      symbol: "ITEM",
      collection: {
        name: "My Collection",
        family: "My Family",
      },
      seller_fee_basis_points: 500,
    };
    const result = tokenMetadataSchema.safeParse(metadataWithCollection);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.collection?.name).toBe("My Collection");
      expect(result.data.seller_fee_basis_points).toBe(500);
    }
  });

  test("should reject invalid metadata", () => {
    const invalidMetadata = {
      // Missing required fields
      description: "Missing name and symbol",
    };
    const result = tokenMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  test("should accept any string for image (URLs not validated)", () => {
    const metadataWithImageString = {
      name: "Any Image String",
      symbol: "IMG",
      image: "not-necessarily-a-url-but-still-valid",
    };
    const result = tokenMetadataSchema.safeParse(metadataWithImageString);
    expect(result.success).toBe(true);
  });

  test("should reject invalid creator shares", () => {
    const invalidShareMetadata = {
      name: "Invalid Share",
      symbol: "SHARE",
      properties: {
        creators: [
          { address: "11111111111111111111111111111111", share: 150 }, // Invalid: > 100
        ],
      },
    };
    const result = tokenMetadataSchema.safeParse(invalidShareMetadata);
    expect(result.success).toBe(false);
  });
});
