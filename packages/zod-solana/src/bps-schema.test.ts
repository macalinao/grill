import { describe, expect, it } from "bun:test";
import { bpsSchema } from "./bps-schema.js";

describe("bpsSchema", () => {
  describe("valid values", () => {
    it("should accept 0 (0%)", () => {
      const result = bpsSchema.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("should accept 1 (0.01%)", () => {
      const result = bpsSchema.safeParse(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1);
      }
    });

    it("should accept 50 (0.5%)", () => {
      const result = bpsSchema.safeParse(50);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(50);
      }
    });

    it("should accept 100 (1%)", () => {
      const result = bpsSchema.safeParse(100);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(100);
      }
    });

    it("should accept 500 (5%)", () => {
      const result = bpsSchema.safeParse(500);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(500);
      }
    });

    it("should accept 1000 (10%)", () => {
      const result = bpsSchema.safeParse(1000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1000);
      }
    });

    it("should accept 5000 (50%)", () => {
      const result = bpsSchema.safeParse(5000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(5000);
      }
    });

    it("should accept 10000 (100%)", () => {
      const result = bpsSchema.safeParse(10000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10000);
      }
    });

    it("should accept various valid values", () => {
      const validValues = [10, 25, 75, 150, 300, 750, 2500, 7500, 9999];
      for (const value of validValues) {
        const result = bpsSchema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });
  });

  describe("invalid values", () => {
    it("should reject -1", () => {
      const result = bpsSchema.safeParse(-1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(">=0");
      }
    });

    it("should reject -100", () => {
      const result = bpsSchema.safeParse(-100);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(">=0");
      }
    });

    it("should reject 10001 (max + 1)", () => {
      const result = bpsSchema.safeParse(10001);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("<=10000");
      }
    });

    it("should reject 50000", () => {
      const result = bpsSchema.safeParse(50000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("<=10000");
      }
    });

    it("should reject 0.5 (non-integer)", () => {
      const result = bpsSchema.safeParse(0.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("expected int");
      }
    });

    it("should reject 100.5 (non-integer)", () => {
      const result = bpsSchema.safeParse(100.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("expected int");
      }
    });

    it("should reject 9999.99 (non-integer)", () => {
      const result = bpsSchema.safeParse(9999.99);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("expected int");
      }
    });

    it("should reject NaN", () => {
      const result = bpsSchema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it("should reject Infinity", () => {
      const result = bpsSchema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject -Infinity", () => {
      const result = bpsSchema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it("should reject string values", () => {
      const result = bpsSchema.safeParse("500");
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = bpsSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = bpsSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("should reject objects", () => {
      const result = bpsSchema.safeParse({ value: 500 });
      expect(result.success).toBe(false);
    });

    it("should reject arrays", () => {
      const result = bpsSchema.safeParse([500]);
      expect(result.success).toBe(false);
    });

    it("should reject boolean values", () => {
      const result = bpsSchema.safeParse(true);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle type coercion correctly", () => {
      const result = bpsSchema.safeParse(10000.0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10000);
      }
    });

    it("should reject very small negative decimals", () => {
      const result = bpsSchema.safeParse(-0.1);
      expect(result.success).toBe(false);
    });

    it("should reject very large numbers", () => {
      const result = bpsSchema.safeParse(Number.MAX_SAFE_INTEGER);
      expect(result.success).toBe(false);
    });

    it("should handle scientific notation within range", () => {
      const result = bpsSchema.safeParse(1e4); // 10000
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10000);
      }
    });

    it("should reject scientific notation out of range", () => {
      const result = bpsSchema.safeParse(1e5); // 100000
      expect(result.success).toBe(false);
    });
  });

  describe("basis points specific tests", () => {
    it("should accept common percentage values in basis points", () => {
      const commonPercentages = [
        { bps: 1, percentage: "0.01%" },
        { bps: 25, percentage: "0.25%" },
        { bps: 50, percentage: "0.5%" },
        { bps: 100, percentage: "1%" },
        { bps: 250, percentage: "2.5%" },
        { bps: 500, percentage: "5%" },
        { bps: 1000, percentage: "10%" },
        { bps: 2500, percentage: "25%" },
        { bps: 5000, percentage: "50%" },
        { bps: 7500, percentage: "75%" },
        { bps: 10000, percentage: "100%" },
      ];

      for (const { bps } of commonPercentages) {
        const result = bpsSchema.safeParse(bps);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(bps);
        }
      }
    });

    it("should have correct description", () => {
      expect(bpsSchema.description).toBe("Basis points (0-10000)");
    });
  });
});
