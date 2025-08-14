import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { createTokenInfo } from "./create-token-info.js";

describe("createTokenInfo", () => {
  describe("with full metadata", () => {
    it("should create TokenInfo with all metadata provided", () => {
      const result = createTokenInfo({
        mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        mintAccount: { decimals: 6 },
        metadataAccount: { name: "USD Coin", symbol: "USDC" },
        metadataUriJson: { image: "https://example.com/usdc.png" },
      });

      expect(result).toEqual({
        mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        iconURL: "https://example.com/usdc.png",
      });
    });

    it("should create TokenInfo without image when metadataUriJson is null", () => {
      const result = createTokenInfo({
        mint: address("So11111111111111111111111111111111111111112"),
        mintAccount: { decimals: 9 },
        metadataAccount: { name: "Wrapped SOL", symbol: "SOL" },
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("So11111111111111111111111111111111111111112"),
        name: "Wrapped SOL",
        symbol: "SOL",
        decimals: 9,
      });
    });

    it("should create TokenInfo without image when metadataUriJson has no image", () => {
      const result = createTokenInfo({
        mint: address("So11111111111111111111111111111111111111112"),
        mintAccount: { decimals: 9 },
        metadataAccount: { name: "Wrapped SOL", symbol: "SOL" },
        metadataUriJson: { image: "" },
      });

      expect(result).toEqual({
        mint: address("So11111111111111111111111111111111111111112"),
        name: "Wrapped SOL",
        symbol: "SOL",
        decimals: 9,
      });
    });
  });

  describe("without metadata account", () => {
    it("should derive name and symbol from mint address", () => {
      const result = createTokenInfo({
        mint: address("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
        mintAccount: { decimals: 8 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
        name: "7vfCXT...",
        symbol: "7VFC",
        decimals: 8,
      });
    });

    it("should handle addresses with mostly numbers", () => {
      const result = createTokenInfo({
        mint: address("11111111111111111111111111111111"),
        mintAccount: { decimals: 0 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("11111111111111111111111111111111"),
        name: "111111...",
        symbol: "1111",
        decimals: 0,
      });
    });

    it("should handle addresses with special characters", () => {
      const result = createTokenInfo({
        mint: address("So11111111111111111111111111111111111111112"),
        mintAccount: { decimals: 9 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("So11111111111111111111111111111111111111112"),
        name: "So1111...",
        symbol: "SO11",
        decimals: 9,
      });
    });

    it("should derive symbol from first 4 alphanumeric characters", () => {
      const result = createTokenInfo({
        mint: address("BZTTfsRpY9s9hSgBdjakUoLFLUzr8x9kMKMxFypLcUGK"),
        mintAccount: { decimals: 4 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("BZTTfsRpY9s9hSgBdjakUoLFLUzr8x9kMKMxFypLcUGK"),
        name: "BZTTfs...",
        symbol: "BZTT",
        decimals: 4,
      });
    });

    it("should handle addresses starting with lowercase letters", () => {
      const result = createTokenInfo({
        mint: address("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
        mintAccount: { decimals: 9 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
        name: "mSoLzY...",
        symbol: "MSOL",
        decimals: 9,
      });
    });

    it("should still include image if provided without metadata account", () => {
      const result = createTokenInfo({
        mint: address("TknWMSqRnP4dqhq5rBx8tPGGMzqrfBQYYp7VbeR5xEk"),
        mintAccount: { decimals: 6 },
        metadataAccount: null,
        metadataUriJson: { image: "https://example.com/token.png" },
      });

      expect(result).toEqual({
        mint: address("TknWMSqRnP4dqhq5rBx8tPGGMzqrfBQYYp7VbeR5xEk"),
        name: "TknWMS...",
        symbol: "TKNW",
        decimals: 6,
        // No iconURL since metadataAccount is null
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty name and symbol in metadata", () => {
      const result = createTokenInfo({
        mint: address("EmSjmSVNbXGfMqLXnQPJNayVrx8TdPWKQ3rUWqCrcT9t"),
        mintAccount: { decimals: 3 },
        metadataAccount: { name: "", symbol: "" },
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("EmSjmSVNbXGfMqLXnQPJNayVrx8TdPWKQ3rUWqCrcT9t"),
        name: "",
        symbol: "",
        decimals: 3,
      });
    });

    it("should handle very long name and symbol", () => {
      const longName =
        "This is a very long token name that exceeds normal length";
      const longSymbol = "VERYLONGSYMBOL";

      const result = createTokenInfo({
        mint: address("LnTRntk96Lc7WMZs6XbRQ9wCtBQszTyRLgdpkczUWsT"),
        mintAccount: { decimals: 9 },
        metadataAccount: { name: longName, symbol: longSymbol },
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("LnTRntk96Lc7WMZs6XbRQ9wCtBQszTyRLgdpkczUWsT"),
        name: longName,
        symbol: longSymbol,
        decimals: 9,
      });
    });

    it("should handle zero decimals", () => {
      const result = createTokenInfo({
        mint: address("NFTxPQ2aULDsaBgn5BdgKGZvQF6QKPDSipWrmNGVwUp"),
        mintAccount: { decimals: 0 },
        metadataAccount: { name: "Cool NFT", symbol: "CNFT" },
        metadataUriJson: { image: "https://example.com/nft.jpg" },
      });

      expect(result).toEqual({
        mint: address("NFTxPQ2aULDsaBgn5BdgKGZvQF6QKPDSipWrmNGVwUp"),
        name: "Cool NFT",
        symbol: "CNFT",
        decimals: 0,
        iconURL: "https://example.com/nft.jpg",
      });
    });

    it("should handle maximum decimals", () => {
      const result = createTokenInfo({
        mint: address("MxZ5KhSytcnFEPJk9xxnSBkwvveKGVbWBNUBfrkvuMp"),
        mintAccount: { decimals: 18 },
        metadataAccount: { name: "Max Decimals", symbol: "MAX" },
        metadataUriJson: null,
      });

      expect(result).toEqual({
        mint: address("MxZ5KhSytcnFEPJk9xxnSBkwvveKGVbWBNUBfrkvuMp"),
        name: "Max Decimals",
        symbol: "MAX",
        decimals: 18,
      });
    });

    it("should preserve type information with specific decimal types", () => {
      const result = createTokenInfo<string, 6>({
        mint: address("TYpEDsQ5BankR5WL6KYSjKfnjrZTQQvh7JJPkBTQHkk"),
        mintAccount: { decimals: 6 as const },
        metadataAccount: { name: "Typed Token", symbol: "TYPED" },
        metadataUriJson: null,
      });

      expect(result.decimals).toBe(6);
      expect(typeof result.decimals).toBe("number");
    });
  });

  describe("symbol derivation", () => {
    it("should handle address with mostly numbers", () => {
      const result = createTokenInfo({
        mint: address("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"),
        mintAccount: { decimals: 0 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result.symbol).toBe("2B1K");
    });

    it("should handle address with mixed case", () => {
      const result = createTokenInfo({
        mint: address("AbCDefGhJ7VfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj"),
        mintAccount: { decimals: 9 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      expect(result.symbol).toBe("ABCD");
    });

    it("should handle address starting with numbers", () => {
      const result = createTokenInfo({
        mint: address("3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"),
        mintAccount: { decimals: 6 },
        metadataAccount: null,
        metadataUriJson: null,
      });

      // Should use first 4 alphanumeric
      expect(result.symbol).toBe("3NZ9");
    });
  });
});
