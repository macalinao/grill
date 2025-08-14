import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { formatTokenAmount } from "./format-token-amount.js";
import { parseTokenAmount } from "./parse-token-amount.js";
import type { TokenInfo } from "./types.js";

describe("formatTokenAmount", () => {
  // Test tokens
  const solToken: TokenInfo<"11111111111111111111111111111111", 9> = {
    mint: address("11111111111111111111111111111111"),
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
  };

  const usdcToken: TokenInfo<
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    6
  > = {
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  };

  describe("basic formatting", () => {
    it("should format whole numbers correctly", () => {
      const amount = parseTokenAmount(solToken, "100");
      expect(formatTokenAmount(amount)).toBe("100");
    });

    it("should format decimal numbers correctly", () => {
      const amount = parseTokenAmount(solToken, "100.5");
      expect(formatTokenAmount(amount)).toBe("100.5");
    });

    it("should format very small numbers", () => {
      const amount = parseTokenAmount(solToken, "0.000000001");
      expect(formatTokenAmount(amount)).toBe("0.000000001");
    });

    it("should format zero", () => {
      const amount = parseTokenAmount(solToken, "0");
      expect(formatTokenAmount(amount)).toBe("0");
    });

    it("should format negative numbers", () => {
      const amount = parseTokenAmount(solToken, "-50.25");
      expect(formatTokenAmount(amount)).toBe("-50.25");
    });

    it("should handle different decimal tokens", () => {
      const usdcAmount = parseTokenAmount(usdcToken, "100.123456");
      expect(formatTokenAmount(usdcAmount)).toBe("100.123456");
    });

    it("should add thousand separators by default", () => {
      const amount = parseTokenAmount(solToken, "1234567.89");
      expect(formatTokenAmount(amount)).toBe("1,234,567.89");
    });
  });

  describe("symbol option", () => {
    it("should add symbol after amount when symbol is true", () => {
      const amount = parseTokenAmount(solToken, "100.5");
      expect(formatTokenAmount(amount, { symbol: true })).toBe("100.5 SOL");
    });

    it("should not add symbol when symbol is false", () => {
      const amount = parseTokenAmount(solToken, "100.5");
      expect(formatTokenAmount(amount, { symbol: false })).toBe("100.5");
    });

    it("should work with different tokens", () => {
      const usdcAmount = parseTokenAmount(usdcToken, "1234.56");
      expect(formatTokenAmount(usdcAmount, { symbol: true })).toBe(
        "1,234.56 USDC",
      );
    });
  });

  describe("digits option", () => {
    it("should limit decimal places when specified", () => {
      const amount = parseTokenAmount(solToken, "100.123456789");
      expect(formatTokenAmount(amount, { digits: 2 })).toBe("100.12");
      expect(formatTokenAmount(amount, { digits: 4 })).toBe("100.1235");
      expect(formatTokenAmount(amount, { digits: 0 })).toBe("100");
    });

    it("should work with trailing zeros option", () => {
      const amount = parseTokenAmount(solToken, "100.5");
      expect(
        formatTokenAmount(amount, { digits: 4, trailingZeros: true }),
      ).toBe("100.5000");
      expect(
        formatTokenAmount(amount, { digits: 4, trailingZeros: false }),
      ).toBe("100.5");
    });

    it("should handle rounding correctly", () => {
      const amount = parseTokenAmount(solToken, "100.999999999");
      expect(formatTokenAmount(amount, { digits: 2 })).toBe("101");
      expect(formatTokenAmount(amount, { digits: 5 })).toBe("101");
    });
  });

  describe("trailingZeros option", () => {
    it("should add trailing zeros when true", () => {
      const amount = parseTokenAmount(usdcToken, "100.5");
      expect(formatTokenAmount(amount, { trailingZeros: true })).toBe(
        "100.500000",
      );
    });

    it("should remove trailing zeros when false", () => {
      const amount = parseTokenAmount(usdcToken, "100.500000");
      expect(formatTokenAmount(amount, { trailingZeros: false })).toBe("100.5");
    });

    it("should work with digits option", () => {
      const amount = parseTokenAmount(solToken, "100");
      expect(
        formatTokenAmount(amount, { digits: 3, trailingZeros: true }),
      ).toBe("100.000");
      expect(
        formatTokenAmount(amount, { digits: 3, trailingZeros: false }),
      ).toBe("100");
    });
  });

  describe("compact option (dnum feature)", () => {
    it("should format with compact notation when enabled", () => {
      const amount = parseTokenAmount(solToken, "1500");
      expect(formatTokenAmount(amount, { compact: true })).toBe("1.5K");
    });

    it("should format millions", () => {
      const amount = parseTokenAmount(solToken, "2500000");
      expect(formatTokenAmount(amount, { compact: true })).toBe("2.5M");
    });

    it("should work with symbol option", () => {
      const amount = parseTokenAmount(solToken, "1500000");
      expect(formatTokenAmount(amount, { compact: true, symbol: true })).toBe(
        "1.5M SOL",
      );
    });
  });

  describe("locale option (dnum feature)", () => {
    it("should format with different locales", () => {
      const amount = parseTokenAmount(solToken, "1234.56");
      expect(formatTokenAmount(amount, { locale: "de-DE" })).toBe("1.234,56");
      expect(formatTokenAmount(amount, { locale: "en-US" })).toBe("1,234.56");
    });

    it("should work with symbol", () => {
      const amount = parseTokenAmount(usdcToken, "1234.56");
      expect(formatTokenAmount(amount, { locale: "de-DE", symbol: true })).toBe(
        "1.234,56 USDC",
      );
    });
  });

  describe("signDisplay option (dnum feature)", () => {
    it("should show sign based on option", () => {
      const positive = parseTokenAmount(solToken, "100");
      const negative = parseTokenAmount(solToken, "-100");

      expect(formatTokenAmount(positive, { signDisplay: "always" })).toBe(
        "+100",
      );
      expect(formatTokenAmount(negative, { signDisplay: "always" })).toBe(
        "-100",
      );
      expect(formatTokenAmount(positive, { signDisplay: "never" })).toBe("100");
      expect(formatTokenAmount(negative, { signDisplay: "never" })).toBe("100");
    });
  });

  describe("complex combinations", () => {
    it("should handle multiple options together", () => {
      const amount = parseTokenAmount(usdcToken, "1234567.891234");

      const result = formatTokenAmount(amount, {
        symbol: true,
        digits: 2,
        trailingZeros: true,
      });

      expect(result).toBe("1,234,567.89 USDC");
    });

    it("should handle compact with symbol and custom digits", () => {
      const amount = parseTokenAmount(solToken, "1500000.123");

      const result = formatTokenAmount(amount, {
        compact: true,
        symbol: true,
        digits: 1,
        trailingZeros: true,
      });

      expect(result).toBe("1.5M SOL");
    });
  });

  describe("edge cases", () => {
    it("should handle very large numbers", () => {
      const amount = parseTokenAmount(solToken, "999999999999999");
      expect(formatTokenAmount(amount, { compact: true })).toBe("1000T");
    });

    it("should handle very small decimals", () => {
      const amount = parseTokenAmount(solToken, "0.000000001");
      expect(formatTokenAmount(amount)).toBe("0.000000001");
      expect(
        formatTokenAmount(amount, { digits: 12, trailingZeros: true }),
      ).toBe("0.000000001000");
    });

    it("should preserve type information", () => {
      const amount = parseTokenAmount(solToken, "100");
      const formatted = formatTokenAmount(amount);
      expect(formatted).toBe("100");
    });
  });

  describe("real-world examples", () => {
    it("should format SOL amounts for display", () => {
      const amount = parseTokenAmount(solToken, "123.456789123");

      // Display with 4 decimal places
      expect(formatTokenAmount(amount, { digits: 4 })).toBe("123.4568");

      // Display with symbol
      expect(formatTokenAmount(amount, { digits: 4, symbol: true })).toBe(
        "123.4568 SOL",
      );

      // Compact for large amounts
      const largeAmount = parseTokenAmount(solToken, "1234567");
      expect(
        formatTokenAmount(largeAmount, { compact: true, symbol: true }),
      ).toBe("1.2M SOL");
    });

    it("should format USDC amounts for display", () => {
      const amount = parseTokenAmount(usdcToken, "1234.567890");

      // Standard USDC display (2 decimals)
      expect(
        formatTokenAmount(amount, { digits: 2, trailingZeros: true }),
      ).toBe("1,234.57");

      // With symbol
      expect(
        formatTokenAmount(amount, {
          digits: 2,
          trailingZeros: true,
          symbol: true,
        }),
      ).toBe("1,234.57 USDC");
    });
  });
});
