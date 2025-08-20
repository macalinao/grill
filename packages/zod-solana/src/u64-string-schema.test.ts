import { describe, expect, it } from "bun:test";
import { U64_MAX } from "./constants.js";
import { u64StringSchema } from "./u64-string-schema.js";

describe("u64StringSchema", () => {
  describe("valid string values", () => {
    it("should accept '0'", () => {
      const result = u64StringSchema.safeParse("0");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("0");
      }
    });

    it("should accept '1'", () => {
      const result = u64StringSchema.safeParse("1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("1");
      }
    });

    it("should accept '4294967296' (u32 boundary + 1)", () => {
      const result = u64StringSchema.safeParse("4294967296");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("4294967296");
      }
    });

    it("should accept '9223372036854775807' (max signed 64-bit)", () => {
      const result = u64StringSchema.safeParse("9223372036854775807");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("9223372036854775807");
      }
    });

    it("should accept '18446744073709551615' (U64_MAX)", () => {
      const result = u64StringSchema.safeParse("18446744073709551615");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("18446744073709551615");
      }
    });

    it("should accept U64_MAX as string", () => {
      const result = u64StringSchema.safeParse(U64_MAX.toString());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(U64_MAX.toString());
      }
    });

    it("should accept various valid string values", () => {
      const validValues = [
        "100",
        "1000",
        "10000",
        "100000",
        "1000000",
        "10000000",
        "100000000",
        "1000000000",
        "10000000000",
        "100000000000",
        "1000000000000",
        "10000000000000",
        "100000000000000",
        "1000000000000000",
        "10000000000000000",
        "100000000000000000",
        "1000000000000000000",
        "10000000000000000000",
      ];
      for (const value of validValues) {
        const result = u64StringSchema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });

    it("should accept string with leading zeros", () => {
      const result = u64StringSchema.safeParse("00001000");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("00001000");
      }
    });

    it("should preserve the original string format", () => {
      const result = u64StringSchema.safeParse("000000000000001");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("000000000000001");
      }
    });
  });

  describe("invalid string values", () => {
    it("should reject '-1'", () => {
      const result = u64StringSchema.safeParse("-1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject '-1000000'", () => {
      const result = u64StringSchema.safeParse("-1000000");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject '18446744073709551616' (U64_MAX + 1)", () => {
      const result = u64StringSchema.safeParse("18446744073709551616");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject very large numbers as strings", () => {
      const result = u64StringSchema.safeParse("99999999999999999999999999999");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject non-numeric strings", () => {
      const result = u64StringSchema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject mixed alphanumeric strings", () => {
      const result = u64StringSchema.safeParse("123abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject strings with decimal points", () => {
      const result = u64StringSchema.safeParse("1000.5");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject strings with scientific notation", () => {
      const result = u64StringSchema.safeParse("1e10");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject empty string", () => {
      const result = u64StringSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject strings with spaces", () => {
      const result = u64StringSchema.safeParse("1000 000");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject strings with leading/trailing spaces", () => {
      const result = u64StringSchema.safeParse(" 1000 ");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject hexadecimal strings", () => {
      const result = u64StringSchema.safeParse("0xFF");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject binary strings", () => {
      const result = u64StringSchema.safeParse("0b1010");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject octal strings", () => {
      const result = u64StringSchema.safeParse("0o77");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject strings with bigint suffix", () => {
      const result = u64StringSchema.safeParse("1000n");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid u64");
      }
    });

    it("should reject special string values", () => {
      const specialValues = [
        "NaN",
        "Infinity",
        "-Infinity",
        "null",
        "undefined",
      ];
      for (const value of specialValues) {
        const result = u64StringSchema.safeParse(value);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain("valid u64");
        }
      }
    });
  });

  describe("type validation", () => {
    it("should reject numbers", () => {
      const result = u64StringSchema.safeParse(1000);
      expect(result.success).toBe(false);
    });

    it("should reject bigints", () => {
      const result = u64StringSchema.safeParse(1000n);
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = u64StringSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = u64StringSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("should reject objects", () => {
      const result = u64StringSchema.safeParse({ value: "1000" });
      expect(result.success).toBe(false);
    });

    it("should reject arrays", () => {
      const result = u64StringSchema.safeParse(["1000"]);
      expect(result.success).toBe(false);
    });

    it("should reject boolean values", () => {
      const result = u64StringSchema.safeParse(true);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle maximum u64 value correctly", () => {
      const maxU64String = "18446744073709551615";
      const result = u64StringSchema.safeParse(maxU64String);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(maxU64String);
      }
    });

    it("should reject one above maximum u64 value", () => {
      const aboveMaxU64String = "18446744073709551616";
      const result = u64StringSchema.safeParse(aboveMaxU64String);
      expect(result.success).toBe(false);
    });

    it("should handle 2^64 - 1 as string", () => {
      const value = ((1n << 64n) - 1n).toString();
      const result = u64StringSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(value);
      }
    });

    it("should reject 2^64 as string", () => {
      const value = (1n << 64n).toString();
      const result = u64StringSchema.safeParse(value);
      expect(result.success).toBe(false);
    });

    it("should handle very long valid numbers", () => {
      const longNumber = "9999999999999999999"; // Still within u64 range
      const result = u64StringSchema.safeParse(longNumber);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(longNumber);
      }
    });

    it("should handle strings with only zeros", () => {
      const result = u64StringSchema.safeParse("0000000000");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("0000000000");
      }
    });

    it("should reject strings with plus sign", () => {
      const result = u64StringSchema.safeParse("+1000");
      expect(result.success).toBe(false);
    });

    it("should reject strings with commas", () => {
      const result = u64StringSchema.safeParse("1,000,000");
      expect(result.success).toBe(false);
    });

    it("should reject strings with underscores", () => {
      const result = u64StringSchema.safeParse("1_000_000");
      expect(result.success).toBe(false);
    });
  });
});
