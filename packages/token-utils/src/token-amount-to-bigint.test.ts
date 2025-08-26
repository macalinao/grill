import type { TokenInfo } from "./types.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { parseTokenAmount } from "./parse-token-amount.js";
import { tokenAmountToBigInt } from "./token-amount-to-bigint.js";

describe("tokenAmountToBigInt", () => {
  // SOL token with 9 decimals
  const solToken: TokenInfo<string, 9> = {
    mint: address("So11111111111111111111111111111111111111112"),
    name: "Wrapped SOL",
    symbol: "SOL",
    decimals: 9 as const,
  };

  // USDC token with 6 decimals
  const usdcToken: TokenInfo<string, 6> = {
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6 as const,
  };

  // Token with 0 decimals
  const nftToken: TokenInfo<string, 0> = {
    mint: address("NFT1111111111111111111111111111111111111111"),
    name: "NFT Token",
    symbol: "NFT",
    decimals: 0 as const,
  };

  // Token with 18 decimals (like Ethereum tokens)
  const ethLikeToken: TokenInfo<string, 18> = {
    mint: address("ETH1111111111111111111111111111111111111111"),
    name: "ETH Like Token",
    symbol: "ETHL",
    decimals: 18 as const,
  };

  describe("basic conversions", () => {
    it("should convert 1 SOL to bigint", () => {
      const amount = parseTokenAmount(solToken, "1");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000n);
    });

    it("should convert 1 USDC to bigint", () => {
      const amount = parseTokenAmount(usdcToken, "1");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000n);
    });

    it("should convert 1 NFT token to bigint", () => {
      const amount = parseTokenAmount(nftToken, "1");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1n);
    });

    it("should convert 1 ETH-like token to bigint", () => {
      const amount = parseTokenAmount(ethLikeToken, "1");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000000000000n);
    });
  });

  describe("decimal values", () => {
    it("should convert 0.5 SOL to bigint", () => {
      const amount = parseTokenAmount(solToken, "0.5");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(500000000n);
    });

    it("should convert 100.25 USDC to bigint", () => {
      const amount = parseTokenAmount(usdcToken, "100.25");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(100250000n);
    });

    it("should convert 0.000000001 SOL to bigint", () => {
      const amount = parseTokenAmount(solToken, "0.000000001");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1n);
    });

    it("should convert 0.000001 USDC to bigint", () => {
      const amount = parseTokenAmount(usdcToken, "0.000001");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1n);
    });
  });

  describe("large values", () => {
    it("should convert 1000000 SOL to bigint", () => {
      const amount = parseTokenAmount(solToken, "1000000");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000000000n);
    });

    it("should convert 1000000 USDC to bigint", () => {
      const amount = parseTokenAmount(usdcToken, "1000000");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000000n);
    });

    it("should convert very large ETH-like token amount to bigint", () => {
      const amount = parseTokenAmount(
        ethLikeToken,
        "999999999.999999999999999999",
      );
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(999999999999999999999999999n);
    });
  });

  describe("edge cases", () => {
    it("should convert 0 to bigint", () => {
      const amount = parseTokenAmount(solToken, "0");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(0n);
    });

    it("should convert 0.0 to bigint", () => {
      const amount = parseTokenAmount(usdcToken, "0.0");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(0n);
    });

    it("should handle maximum precision for SOL", () => {
      const amount = parseTokenAmount(solToken, "0.123456789");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123456789n);
    });

    it("should handle maximum precision for USDC", () => {
      const amount = parseTokenAmount(usdcToken, "0.123456");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123456n);
    });

    it("should truncate excess precision for SOL", () => {
      const amount = parseTokenAmount(solToken, "0.1234567891234");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123456789n);
    });

    it("should truncate excess precision for USDC", () => {
      const amount = parseTokenAmount(usdcToken, "0.1234567");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123456n);
    });
  });

  describe("number inputs", () => {
    it("should convert number 1.5 SOL to bigint", () => {
      const amount = parseTokenAmount(solToken, 1.5);
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1500000000n);
    });

    it("should convert number 99.99 USDC to bigint", () => {
      const amount = parseTokenAmount(usdcToken, 99.99);
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(99990000n);
    });

    it("should convert number 0 to bigint", () => {
      const amount = parseTokenAmount(solToken, 0);
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(0n);
    });
  });

  describe("scientific notation", () => {
    it("should handle scientific notation for small values", () => {
      const amount = parseTokenAmount(solToken, "1e-9");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1n);
    });

    it("should handle scientific notation for large values", () => {
      const amount = parseTokenAmount(solToken, "1e6");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000000000n);
    });

    it("should handle scientific notation for USDC", () => {
      const amount = parseTokenAmount(usdcToken, "1e3");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000n);
    });
  });

  describe("special string formats", () => {
    it("should handle underscores in numbers", () => {
      const amount = parseTokenAmount(solToken, "1_000_000");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1000000000000000n);
    });

    it("should handle leading zeros", () => {
      const amount = parseTokenAmount(usdcToken, "00100.00");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(100000000n);
    });

    it("should handle trailing zeros", () => {
      const amount = parseTokenAmount(usdcToken, "100.250000");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(100250000n);
    });
  });

  describe("fractional amounts with different decimals", () => {
    it("should convert 0.123 SOL correctly", () => {
      const amount = parseTokenAmount(solToken, "0.123");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123000000n);
    });

    it("should convert 0.123 USDC correctly", () => {
      const amount = parseTokenAmount(usdcToken, "0.123");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123000n);
    });

    it("should convert 0.123 ETH-like token correctly", () => {
      const amount = parseTokenAmount(ethLikeToken, "0.123");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(123000000000000000n);
    });
  });

  describe("consistency tests", () => {
    it("should produce same result for equivalent string representations", () => {
      const amount1 = parseTokenAmount(solToken, "100");
      const amount2 = parseTokenAmount(solToken, "100.0");
      const amount3 = parseTokenAmount(solToken, "100.000000000");

      const result1 = tokenAmountToBigInt(amount1);
      const result2 = tokenAmountToBigInt(amount2);
      const result3 = tokenAmountToBigInt(amount3);

      expect(result1).toBe(100000000000n);
      expect(result2).toBe(result1);
      expect(result3).toBe(result1);
    });

    it("should handle multiple conversions correctly", () => {
      const amounts = ["1", "10", "100", "1000", "10000"];
      const results = amounts.map((a) => {
        const amount = parseTokenAmount(usdcToken, a);
        return tokenAmountToBigInt(amount);
      });

      expect(results).toEqual([
        1000000n,
        10000000n,
        100000000n,
        1000000000n,
        10000000000n,
      ]);
    });
  });

  describe("boundary values", () => {
    it("should handle very small positive values", () => {
      const amount = parseTokenAmount(ethLikeToken, "0.000000000000000001");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(1n);
    });

    it("should handle maximum safe integer as string", () => {
      const amount = parseTokenAmount(nftToken, "9007199254740991");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(9007199254740991n);
    });

    it("should handle values beyond JavaScript number precision", () => {
      const amount = parseTokenAmount(nftToken, "99999999999999999999");
      const result = tokenAmountToBigInt(amount);
      expect(result).toBe(99999999999999999999n);
    });
  });
});
