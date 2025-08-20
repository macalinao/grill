import { describe, expect, it } from "bun:test";
import { U16_MAX } from "./constants.js";
import { u16Schema } from "./u16-schema.js";

describe("u16Schema", () => {
  describe("valid values", () => {
    it("should accept 0", () => {
      const result = u16Schema.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("should accept 1", () => {
      const result = u16Schema.safeParse(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1);
      }
    });

    it("should accept 256 (u8 boundary)", () => {
      const result = u16Schema.safeParse(256);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(256);
      }
    });

    it("should accept 32767 (middle value)", () => {
      const result = u16Schema.safeParse(32767);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(32767);
      }
    });

    it("should accept 65535 (U16_MAX)", () => {
      const result = u16Schema.safeParse(65535);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(65535);
      }
    });

    it("should accept U16_MAX constant", () => {
      const result = u16Schema.safeParse(U16_MAX);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(U16_MAX);
      }
    });

    it("should accept various valid values", () => {
      const validValues = [10, 100, 1000, 10000, 50000, 60000];
      for (const value of validValues) {
        const result = u16Schema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });
  });

  describe("invalid values", () => {
    it("should reject -1", () => {
      const result = u16Schema.safeParse(-1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject -1000", () => {
      const result = u16Schema.safeParse(-1000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject 65536 (U16_MAX + 1)", () => {
      const result = u16Schema.safeParse(65536);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 65535");
      }
    });

    it("should reject 100000", () => {
      const result = u16Schema.safeParse(100000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 65535");
      }
    });

    it("should reject 0.5 (non-integer)", () => {
      const result = u16Schema.safeParse(0.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject 32767.5 (non-integer)", () => {
      const result = u16Schema.safeParse(32767.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject 999.999 (non-integer)", () => {
      const result = u16Schema.safeParse(999.999);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject NaN", () => {
      const result = u16Schema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it("should reject Infinity", () => {
      const result = u16Schema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject -Infinity", () => {
      const result = u16Schema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject string values", () => {
      const result = u16Schema.safeParse("1000");
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = u16Schema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = u16Schema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("should reject objects", () => {
      const result = u16Schema.safeParse({ value: 1000 });
      expect(result.success).toBe(false);
    });

    it("should reject arrays", () => {
      const result = u16Schema.safeParse([1000]);
      expect(result.success).toBe(false);
    });

    it("should reject boolean values", () => {
      const result = u16Schema.safeParse(true);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle type coercion correctly", () => {
      const result = u16Schema.safeParse(65535.0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(65535);
      }
    });

    it("should reject very small negative decimals", () => {
      const result = u16Schema.safeParse(-0.1);
      expect(result.success).toBe(false);
    });

    it("should reject very large numbers", () => {
      const result = u16Schema.safeParse(Number.MAX_SAFE_INTEGER);
      expect(result.success).toBe(false);
    });

    it("should handle scientific notation within range", () => {
      const result = u16Schema.safeParse(1e4); // 10000
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10000);
      }
    });

    it("should reject scientific notation out of range", () => {
      const result = u16Schema.safeParse(1e6); // 1000000
      expect(result.success).toBe(false);
    });
  });
});
