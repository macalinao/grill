import type * as z from "zod";
import { describe, expect, it } from "bun:test";
import { signature } from "@solana/kit";
import { signatureSchema } from "./signature-schema.js";

const VALID_SIGNATURE =
  "2AXDGYSE4f2sz7tvMMzyHvUfcoJmxudvdhBcmiUSo6ijwfYmfZYsKRxboQMPh3R4kUhXRVdtSXFXMheka4Rc4P2";

describe("signatureSchema", () => {
  it("should validate and transform a valid signature", () => {
    const result = signatureSchema.parse(VALID_SIGNATURE);

    expect(result).toBe(signature(VALID_SIGNATURE));
  });

  it("should accept the all-zero signature", () => {
    const zeroSignature = "1".repeat(64);
    const result = signatureSchema.parse(zeroSignature);

    expect(result).toBe(signature(zeroSignature));
  });

  it("should reject empty strings", () => {
    expect(() => signatureSchema.parse("")).toThrow();
  });

  it("should reject signatures with invalid characters", () => {
    expect(() => signatureSchema.parse(`0OIl+/${"1".repeat(82)}`)).toThrow();
  });

  it("should reject signatures that are too short", () => {
    expect(() => signatureSchema.parse("abc")).toThrow();
  });

  it("should reject signatures that are too long", () => {
    expect(() => signatureSchema.parse("1".repeat(96))).toThrow();
  });

  it("should reject a 32-byte value such as an address", () => {
    expect(() =>
      signatureSchema.parse("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    ).toThrow();
  });

  it("should provide a helpful error message for invalid signatures", () => {
    const result = signatureSchema.safeParse("not-a-valid-signature");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid Solana signature");
    }
  });

  it("should work with safeParse", () => {
    const validResult = signatureSchema.safeParse(VALID_SIGNATURE);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data).toBe(signature(VALID_SIGNATURE));
    }

    const invalidResult = signatureSchema.safeParse("invalid");
    expect(invalidResult.success).toBe(false);
  });

  it("should infer the correct TypeScript type", () => {
    // This is a compile-time test
    type InferredType = z.output<typeof signatureSchema>;
    const testSignature: InferredType = signature(VALID_SIGNATURE);

    expect(testSignature).toBeDefined();
  });
});
