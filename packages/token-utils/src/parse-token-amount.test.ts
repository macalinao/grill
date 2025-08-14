import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { parseTokenAmount } from "./parse-token-amount.js";
import type { TokenInfo } from "./types.js";

describe("parseTokenAmount", () => {
  // Test token with 9 decimals (like SOL)
  const solToken: TokenInfo<"11111111111111111111111111111111", 9> = {
    mint: address("11111111111111111111111111111111"),
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
  };

  // Test token with 6 decimals (like USDC)
  const usdcToken: TokenInfo<
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    6
  > = {
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  };

  // Test token with 0 decimals (NFT-like)
  const nftToken: TokenInfo<"NFT1111111111111111111111111111111111111112", 0> =
    {
      mint: address("NFT1111111111111111111111111111111111111112"),
      name: "NFT Token",
      symbol: "NFT",
      decimals: 0,
    };

  describe("with string inputs", () => {
    it("should parse whole numbers correctly", () => {
      const result = parseTokenAmount(solToken, "1");
      expect(result.token).toBe(solToken);
      expect(result.amount[0]).toBe(1000000000n); // 1 SOL = 1e9 lamports
      expect(result.amount[1]).toBe(9);
    });

    it("should parse decimal numbers correctly", () => {
      const result = parseTokenAmount(solToken, "1.5");
      expect(result.amount[0]).toBe(1500000000n); // 1.5 SOL = 1.5e9 lamports
      expect(result.amount[1]).toBe(9);
    });

    it("should parse very small decimal numbers", () => {
      const result = parseTokenAmount(solToken, "0.000000001");
      expect(result.amount[0]).toBe(1n); // 1 lamport
      expect(result.amount[1]).toBe(9);
    });

    it("should parse very large numbers", () => {
      const result = parseTokenAmount(solToken, "1000000");
      expect(result.amount[0]).toBe(1000000000000000n); // 1M SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should handle zero correctly", () => {
      const result = parseTokenAmount(solToken, "0");
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle numbers with many decimal places", () => {
      const result = parseTokenAmount(solToken, "0.123456789");
      expect(result.amount[0]).toBe(123456789n);
      expect(result.amount[1]).toBe(9);
    });

    it("should truncate excess decimal places", () => {
      const result = parseTokenAmount(solToken, "0.1234567891234");
      // Should truncate to 9 decimal places
      expect(result.amount[0]).toBe(123456789n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle scientific notation", () => {
      const result = parseTokenAmount(solToken, "1e-9");
      expect(result.amount[0]).toBe(1n); // 1 lamport
      expect(result.amount[1]).toBe(9);
    });

    it("should handle negative numbers", () => {
      const result = parseTokenAmount(solToken, "-1");
      expect(result.amount[0]).toBe(-1000000000n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("with number inputs", () => {
    it("should parse integer numbers", () => {
      const result = parseTokenAmount(solToken, 100);
      expect(result.amount[0]).toBe(100000000000n); // 100 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should parse floating point numbers", () => {
      const result = parseTokenAmount(solToken, 1.23);
      expect(result.amount[0]).toBe(1230000000n); // 1.23 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should handle very small numbers", () => {
      const result = parseTokenAmount(solToken, 0.000000001);
      expect(result.amount[0]).toBe(1n); // 1 lamport
      expect(result.amount[1]).toBe(9);
    });

    it("should handle zero", () => {
      const result = parseTokenAmount(solToken, 0);
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle negative numbers", () => {
      const result = parseTokenAmount(solToken, -5.5);
      expect(result.amount[0]).toBe(-5500000000n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("with different decimal tokens", () => {
    it("should work with 6 decimal token (USDC)", () => {
      const result = parseTokenAmount(usdcToken, "100.50");
      expect(result.token).toBe(usdcToken);
      expect(result.amount[0]).toBe(100500000n); // 100.50 USDC
      expect(result.amount[1]).toBe(6);
    });

    it("should handle small amounts for 6 decimal token", () => {
      const result = parseTokenAmount(usdcToken, "0.000001");
      expect(result.amount[0]).toBe(1n); // 1 micro USDC
      expect(result.amount[1]).toBe(6);
    });

    it("should work with 0 decimal token (NFT)", () => {
      const result = parseTokenAmount(nftToken, "5");
      expect(result.token).toBe(nftToken);
      expect(result.amount[0]).toBe(5n);
      expect(result.amount[1]).toBe(0);
    });

    it("should round decimals for 0 decimal token", () => {
      const result = parseTokenAmount(nftToken, "5.7");
      // Should round down to 5
      expect(result.amount[0]).toBe(5n);
      expect(result.amount[1]).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string as zero", () => {
      const result = parseTokenAmount(solToken, "");
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle whitespace", () => {
      const result = parseTokenAmount(solToken, "  1.5  ");
      expect(result.amount[0]).toBe(1500000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle string with underscores", () => {
      const result = parseTokenAmount(solToken, "1_000_000");
      expect(result.amount[0]).toBe(1000000000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle NaN as zero", () => {
      const result = parseTokenAmount(solToken, Number.NaN);
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle Infinity", () => {
      expect(() =>
        parseTokenAmount(solToken, Number.POSITIVE_INFINITY),
      ).toThrow();
    });

    it("should handle negative Infinity", () => {
      expect(() =>
        parseTokenAmount(solToken, Number.NEGATIVE_INFINITY),
      ).toThrow();
    });
  });

  describe("type preservation", () => {
    it("should preserve token type information", () => {
      const result = parseTokenAmount(solToken, "1");
      // TypeScript should infer the correct types
      const mint: "11111111111111111111111111111111" = result.token.mint;
      const decimals: 9 = result.token.decimals;
      const amount: readonly [bigint, 9] = result.amount;

      expect(mint).toBe(address("11111111111111111111111111111111"));
      expect(decimals).toBe(9);
      expect(amount[0]).toBe(1000000000n);
    });

    it("should work with generic token type", () => {
      const genericToken: TokenInfo = {
        mint: address("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
        name: "Generic",
        symbol: "GEN",
        decimals: 8,
      };

      const result = parseTokenAmount(genericToken, "1");
      expect(result.amount[0]).toBe(100000000n);
      expect(result.amount[1]).toBe(8);
    });
  });

  describe("precision and rounding", () => {
    it("should maintain precision for exact decimal representations", () => {
      const result = parseTokenAmount(solToken, "0.123456789");
      expect(result.amount[0]).toBe(123456789n);
    });

    it("should handle repeating decimals", () => {
      const result = parseTokenAmount(usdcToken, "0.333333");
      expect(result.amount[0]).toBe(333333n);
      expect(result.amount[1]).toBe(6);
    });

    it("should handle very long decimal strings", () => {
      const longDecimal = "1." + "1".repeat(20);
      const result = parseTokenAmount(solToken, longDecimal);
      // Should be 1.111111111 (9 decimal places)
      expect(result.amount[0]).toBe(1111111111n);
    });
  });
});
