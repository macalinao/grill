import { describe, expect, it } from "bun:test";
import { U32_MAX } from "./constants.js";
import { u32Schema } from "./u32-schema.js";

describe("u32Schema", () => {
  describe("valid values", () => {
    it("should accept 0", () => {
      const result = u32Schema.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("should accept 1", () => {
      const result = u32Schema.safeParse(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1);
      }
    });

    it("should accept 65536 (u16 boundary + 1)", () => {
      const result = u32Schema.safeParse(65536);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(65536);
      }
    });

    it("should accept 2147483647 (middle value)", () => {
      const result = u32Schema.safeParse(2147483647);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(2147483647);
      }
    });

    it("should accept 4294967295 (U32_MAX)", () => {
      const result = u32Schema.safeParse(4294967295);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(4294967295);
      }
    });

    it("should accept U32_MAX constant", () => {
      const result = u32Schema.safeParse(U32_MAX);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(U32_MAX);
      }
    });

    it("should accept various valid values", () => {
      const validValues = [
        100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
        2000000000, 3000000000, 4000000000,
      ];
      for (const value of validValues) {
        const result = u32Schema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });
  });

  describe("invalid values", () => {
    it("should reject -1", () => {
      const result = u32Schema.safeParse(-1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject -1000000", () => {
      const result = u32Schema.safeParse(-1000000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject 4294967296 (U32_MAX + 1)", () => {
      const result = u32Schema.safeParse(4294967296);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 4294967295");
      }
    });

    it("should reject 5000000000", () => {
      const result = u32Schema.safeParse(5000000000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 4294967295");
      }
    });

    it("should reject 0.5 (non-integer)", () => {
      const result = u32Schema.safeParse(0.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject 1000000.5 (non-integer)", () => {
      const result = u32Schema.safeParse(1000000.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject 999.999 (non-integer)", () => {
      const result = u32Schema.safeParse(999.999);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject NaN", () => {
      const result = u32Schema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it("should reject Infinity", () => {
      const result = u32Schema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject -Infinity", () => {
      const result = u32Schema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject string values", () => {
      const result = u32Schema.safeParse("1000000");
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = u32Schema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = u32Schema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("should reject objects", () => {
      const result = u32Schema.safeParse({ value: 1000000 });
      expect(result.success).toBe(false);
    });

    it("should reject arrays", () => {
      const result = u32Schema.safeParse([1000000]);
      expect(result.success).toBe(false);
    });

    it("should reject boolean values", () => {
      const result = u32Schema.safeParse(false);
      expect(result.success).toBe(false);
    });

    it("should reject bigint values", () => {
      const result = u32Schema.safeParse(1000n);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle type coercion correctly", () => {
      const result = u32Schema.safeParse(4294967295.0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(4294967295);
      }
    });

    it("should reject very small negative decimals", () => {
      const result = u32Schema.safeParse(-0.00001);
      expect(result.success).toBe(false);
    });

    it("should reject very large numbers", () => {
      const result = u32Schema.safeParse(Number.MAX_SAFE_INTEGER);
      expect(result.success).toBe(false);
    });

    it("should handle scientific notation within range", () => {
      const result = u32Schema.safeParse(1e9); // 1000000000
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1000000000);
      }
    });

    it("should reject scientific notation out of range", () => {
      const result = u32Schema.safeParse(1e10); // 10000000000
      expect(result.success).toBe(false);
    });

    it("should handle maximum safe integer operations", () => {
      const result = u32Schema.safeParse(2 ** 32 - 1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(4294967295);
      }
    });

    it("should reject 2^32", () => {
      const result = u32Schema.safeParse(2 ** 32);
      expect(result.success).toBe(false);
    });
  });
});
