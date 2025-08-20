import { describe, expect, it } from "bun:test";
import { U8_MAX } from "./constants.js";
import { u8Schema } from "./u8-schema.js";

describe("u8Schema", () => {
  describe("valid values", () => {
    it("should accept 0", () => {
      const result = u8Schema.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("should accept 1", () => {
      const result = u8Schema.safeParse(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1);
      }
    });

    it("should accept 127 (middle value)", () => {
      const result = u8Schema.safeParse(127);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(127);
      }
    });

    it("should accept 255 (U8_MAX)", () => {
      const result = u8Schema.safeParse(255);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(255);
      }
    });

    it("should accept U8_MAX constant", () => {
      const result = u8Schema.safeParse(U8_MAX);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(U8_MAX);
      }
    });
  });

  describe("invalid values", () => {
    it("should reject -1", () => {
      const result = u8Schema.safeParse(-1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject -100", () => {
      const result = u8Schema.safeParse(-100);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 0");
      }
    });

    it("should reject 256 (U8_MAX + 1)", () => {
      const result = u8Schema.safeParse(256);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 255");
      }
    });

    it("should reject 1000", () => {
      const result = u8Schema.safeParse(1000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 255");
      }
    });

    it("should reject 0.5 (non-integer)", () => {
      const result = u8Schema.safeParse(0.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject 127.7 (non-integer)", () => {
      const result = u8Schema.safeParse(127.7);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("should reject NaN", () => {
      const result = u8Schema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it("should reject Infinity", () => {
      const result = u8Schema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject -Infinity", () => {
      const result = u8Schema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject string values", () => {
      const result = u8Schema.safeParse("100");
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = u8Schema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = u8Schema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("should reject objects", () => {
      const result = u8Schema.safeParse({ value: 100 });
      expect(result.success).toBe(false);
    });

    it("should reject arrays", () => {
      const result = u8Schema.safeParse([100]);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle type coercion correctly", () => {
      const result = u8Schema.safeParse(255.0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(255);
      }
    });

    it("should reject very small negative numbers", () => {
      const result = u8Schema.safeParse(-0.1);
      expect(result.success).toBe(false);
    });

    it("should reject very large numbers", () => {
      const result = u8Schema.safeParse(Number.MAX_SAFE_INTEGER);
      expect(result.success).toBe(false);
    });
  });
});
