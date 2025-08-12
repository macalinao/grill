import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import type { z } from "zod";
import { addressSchema } from "./address-schema.js";

describe("addressSchema", () => {
  it("should validate and transform a valid Solana address", () => {
    const validAddress = "11111111111111111111111111111111";
    const result = addressSchema.parse(validAddress);

    expect(result).toBe(address(validAddress));
  });

  it("should accept Ed25519 public key addresses", () => {
    const validAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const result = addressSchema.parse(validAddress);

    expect(result).toBe(address(validAddress));
  });

  it("should reject invalid addresses", () => {
    const invalidAddress = "invalid-address";

    expect(() => addressSchema.parse(invalidAddress)).toThrow();
  });

  it("should reject empty strings", () => {
    expect(() => addressSchema.parse("")).toThrow();
  });

  it("should reject addresses with invalid characters", () => {
    const invalidAddress = "111111111111111111111111111111!@";

    expect(() => addressSchema.parse(invalidAddress)).toThrow();
  });

  it("should reject addresses that are too short", () => {
    const shortAddress = "11111111";

    expect(() => addressSchema.parse(shortAddress)).toThrow();
  });

  it("should reject addresses that are too long", () => {
    const longAddress = "1111111111111111111111111111111111111111111111111111";

    expect(() => addressSchema.parse(longAddress)).toThrow();
  });

  it("should provide a helpful error message for invalid addresses", () => {
    const invalidAddress = "not-a-valid-address";

    try {
      addressSchema.parse(invalidAddress);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as { issues: { message: string }[] };
        expect(zodError.issues[0]?.message).toBe("Invalid Solana address");
      }
    }
  });

  it("should work with safeParse", () => {
    const validAddress = "11111111111111111111111111111111";
    const invalidAddress = "invalid";

    const validResult = addressSchema.safeParse(validAddress);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data).toBe(address(validAddress));
    }

    const invalidResult = addressSchema.safeParse(invalidAddress);
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error.issues[0]?.message).toBe(
        "Invalid Solana address",
      );
    }
  });

  it("should infer the correct TypeScript type", () => {
    // This is a compile-time test
    type InferredType = z.output<typeof addressSchema>;
    const testAddress: InferredType = address(
      "11111111111111111111111111111111",
    );

    expect(testAddress).toBeDefined();
  });
});
