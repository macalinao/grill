import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { createLamports, NATIVE_SOL, parseSolAmount } from "./native-sol.js";

describe("NATIVE_SOL", () => {
  it("should have correct properties", () => {
    expect(NATIVE_SOL.mint).toBe(address("11111111111111111111111111111111"));
    expect(NATIVE_SOL.name).toBe("Solana");
    expect(NATIVE_SOL.symbol).toBe("SOL");
    expect(NATIVE_SOL.decimals).toBe(9);
    expect(NATIVE_SOL.iconURL).toContain("data:image/svg+xml");
  });
});

describe("createLamports", () => {
  it("should create a TokenAmount from lamports", () => {
    const amount = createLamports(1000000000n); // 1 SOL

    expect(amount.token).toBe(NATIVE_SOL);
    expect(amount.amount[0]).toBe(1000000000n);
    expect(amount.amount[1]).toBe(9);
  });

  it("should handle zero lamports", () => {
    const amount = createLamports(0n);

    expect(amount.amount[0]).toBe(0n);
    expect(amount.amount[1]).toBe(9);
  });

  it("should handle 1 lamport", () => {
    const amount = createLamports(1n);

    expect(amount.amount[0]).toBe(1n);
    expect(amount.amount[1]).toBe(9);
  });

  it("should handle large amounts", () => {
    const amount = createLamports(1000000000000000000n); // 1 billion SOL

    expect(amount.amount[0]).toBe(1000000000000000000n);
    expect(amount.amount[1]).toBe(9);
  });
});

describe("parseSolAmount", () => {
  describe("with string inputs", () => {
    it("should parse whole numbers correctly", () => {
      const result = parseSolAmount("1");
      expect(result.token).toBe(NATIVE_SOL);
      expect(result.amount[0]).toBe(1000000000n); // 1 SOL = 1e9 lamports
      expect(result.amount[1]).toBe(9);
    });

    it("should parse decimal numbers correctly", () => {
      const result = parseSolAmount("1.5");
      expect(result.amount[0]).toBe(1500000000n); // 1.5 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should parse very small amounts (1 lamport)", () => {
      const result = parseSolAmount("0.000000001");
      expect(result.amount[0]).toBe(1n); // 1 lamport
      expect(result.amount[1]).toBe(9);
    });

    it("should parse very large numbers", () => {
      const result = parseSolAmount("1000000");
      expect(result.amount[0]).toBe(1000000000000000n); // 1M SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should handle zero correctly", () => {
      const result = parseSolAmount("0");
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle numbers with many decimal places", () => {
      const result = parseSolAmount("0.123456789");
      expect(result.amount[0]).toBe(123456789n);
      expect(result.amount[1]).toBe(9);
    });

    it("should truncate excess decimal places", () => {
      const result = parseSolAmount("0.1234567891234");
      // Should truncate to 9 decimal places
      expect(result.amount[0]).toBe(123456789n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("with number inputs", () => {
    it("should parse integer numbers", () => {
      const result = parseSolAmount(100);
      expect(result.amount[0]).toBe(100000000000n); // 100 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should parse floating point numbers", () => {
      const result = parseSolAmount(1.23);
      expect(result.amount[0]).toBe(1230000000n); // 1.23 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should handle very small numbers", () => {
      const result = parseSolAmount(0.000000001);
      expect(result.amount[0]).toBe(1n); // 1 lamport
      expect(result.amount[1]).toBe(9);
    });

    it("should handle zero", () => {
      const result = parseSolAmount(0);
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string as zero", () => {
      const result = parseSolAmount("");
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle whitespace", () => {
      const result = parseSolAmount("  1.5  ");
      expect(result.amount[0]).toBe(1500000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle string with underscores", () => {
      const result = parseSolAmount("1_000");
      expect(result.amount[0]).toBe(1000000000000n); // 1,000 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should handle string with commas", () => {
      const result = parseSolAmount("1,000");
      expect(result.amount[0]).toBe(1000000000000n); // 1,000 SOL
      expect(result.amount[1]).toBe(9);
    });

    it("should handle NaN as zero", () => {
      const result = parseSolAmount(Number.NaN);
      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should throw on Infinity", () => {
      expect(() => parseSolAmount(Number.POSITIVE_INFINITY)).toThrow();
    });
  });

  describe("type preservation", () => {
    it("should return correct types", () => {
      const result = parseSolAmount("1");
      // TypeScript should infer the correct types
      const mint: "11111111111111111111111111111111" = result.token.mint;
      const decimals: 9 = result.token.decimals;
      const amount: readonly [bigint, 9] = result.amount;

      expect(mint).toBe(address("11111111111111111111111111111111"));
      expect(decimals).toBe(9);
      expect(amount[0]).toBe(1000000000n);
    });
  });
});
