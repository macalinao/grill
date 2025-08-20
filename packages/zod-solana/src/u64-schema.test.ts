import { describe, expect, it } from "bun:test";
import { U64_MAX } from "./constants.js";
import { u64Schema } from "./u64-schema.js";

describe("u64Schema", () => {
  describe("valid values", () => {
    it("should accept 0n", () => {
      const result = u64Schema.safeParse(0n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0n);
      }
    });

    it("should accept 1n", () => {
      const result = u64Schema.safeParse(1n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1n);
      }
    });

    it("should accept 4294967296n (u32 boundary + 1)", () => {
      const result = u64Schema.safeParse(4294967296n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(4294967296n);
      }
    });

    it("should accept 9223372036854775807n (middle value)", () => {
      const result = u64Schema.safeParse(9223372036854775807n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(9223372036854775807n);
      }
    });

    it("should accept 18446744073709551615n (U64_MAX)", () => {
      const result = u64Schema.safeParse(18446744073709551615n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(18446744073709551615n);
      }
    });

    it("should accept U64_MAX constant", () => {
      const result = u64Schema.safeParse(U64_MAX);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(U64_MAX);
      }
    });

    it("should accept various valid bigint values", () => {
      const validValues = [
        100n,
        1000n,
        10000n,
        100000n,
        1000000n,
        10000000n,
        100000000n,
        1000000000n,
        10000000000n,
        100000000000n,
        1000000000000n,
        10000000000000n,
        100000000000000n,
        1000000000000000n,
        10000000000000000n,
        100000000000000000n,
        1000000000000000000n,
        10000000000000000000n,
      ];
      for (const value of validValues) {
        const result = u64Schema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });

    it("should accept 2^63 - 1 (max signed 64-bit)", () => {
      const result = u64Schema.safeParse(9223372036854775807n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(9223372036854775807n);
      }
    });

    it("should accept 2^63 (above max signed 64-bit)", () => {
      const result = u64Schema.safeParse(9223372036854775808n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(9223372036854775808n);
      }
    });
  });

  describe("invalid values", () => {
    it("should reject -1n", () => {
      const result = u64Schema.safeParse(-1n);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject -1000000n", () => {
      const result = u64Schema.safeParse(-1000000n);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject 18446744073709551616n (U64_MAX + 1)", () => {
      const result = u64Schema.safeParse(18446744073709551616n);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          `at most ${String(U64_MAX)}`,
        );
      }
    });

    it("should reject 2^65", () => {
      const result = u64Schema.safeParse(36893488147419103232n);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          `at most ${String(U64_MAX)}`,
        );
      }
    });

    it("should reject 2^100", () => {
      const result = u64Schema.safeParse(1267650600228229401496703205376n);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          `at most ${String(U64_MAX)}`,
        );
      }
    });

    it("should reject regular numbers", () => {
      const result = u64Schema.safeParse(1000);
      expect(result.success).toBe(false);
    });

    it("should reject floating point numbers", () => {
      const result = u64Schema.safeParse(1000.5);
      expect(result.success).toBe(false);
    });

    it("should reject NaN", () => {
      const result = u64Schema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it("should reject Infinity", () => {
      const result = u64Schema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject -Infinity", () => {
      const result = u64Schema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject string values", () => {
      const result = u64Schema.safeParse("1000000");
      expect(result.success).toBe(false);
    });

    it("should reject string bigint notation", () => {
      const result = u64Schema.safeParse("1000000n");
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = u64Schema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = u64Schema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("should reject objects", () => {
      const result = u64Schema.safeParse({ value: 1000000n });
      expect(result.success).toBe(false);
    });

    it("should reject arrays", () => {
      const result = u64Schema.safeParse([1000000n]);
      expect(result.success).toBe(false);
    });

    it("should reject boolean values", () => {
      const result = u64Schema.safeParse(true);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle very large valid bigints", () => {
      const result = u64Schema.safeParse(18446744073709551614n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(18446744073709551614n);
      }
    });

    it("should reject negative bigints close to 0", () => {
      const result = u64Schema.safeParse(-1n);
      expect(result.success).toBe(false);
    });

    it("should handle 2^64 - 1 correctly", () => {
      const value = (1n << 64n) - 1n;
      const result = u64Schema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(U64_MAX);
      }
    });

    it("should reject 2^64", () => {
      const value = 1n << 64n;
      const result = u64Schema.safeParse(value);
      expect(result.success).toBe(false);
    });

    it("should handle powers of 2 within range", () => {
      const powers = [
        1n, // 2^0
        2n, // 2^1
        4n, // 2^2
        256n, // 2^8
        65536n, // 2^16
        4294967296n, // 2^32
        281474976710656n, // 2^48
        9223372036854775808n, // 2^63
      ];
      for (const value of powers) {
        const result = u64Schema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });
  });
});
