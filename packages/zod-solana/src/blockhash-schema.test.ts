import type * as z from "zod";
import { describe, expect, it } from "bun:test";
import { blockhash } from "@solana/kit";
import { blockhashSchema } from "./blockhash-schema.js";

const VALID_BLOCKHASH = "8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR";

describe("blockhashSchema", () => {
  it("should validate and transform a valid blockhash", () => {
    const result = blockhashSchema.parse(VALID_BLOCKHASH);

    expect(result).toBe(blockhash(VALID_BLOCKHASH));
  });

  it("should accept the all-zero blockhash", () => {
    const zeroBlockhash = "1".repeat(32);
    const result = blockhashSchema.parse(zeroBlockhash);

    expect(result).toBe(blockhash(zeroBlockhash));
  });

  it("should reject empty strings", () => {
    expect(() => blockhashSchema.parse("")).toThrow();
  });

  it("should reject blockhashes with invalid characters", () => {
    expect(() => blockhashSchema.parse(`0OIl+/${"1".repeat(38)}`)).toThrow();
  });

  it("should reject blockhashes that are too short", () => {
    expect(() => blockhashSchema.parse("abc")).toThrow();
  });

  it("should reject a 64-byte value such as a signature", () => {
    expect(() =>
      blockhashSchema.parse(
        "2AXDGYSE4f2sz7tvMMzyHvUfcoJmxudvdhBcmiUSo6ijwfYmfZYsKRxboQMPh3R4kUhXRVdtSXFXMheka4Rc4P2",
      ),
    ).toThrow();
  });

  it("should provide a helpful error message for invalid blockhashes", () => {
    const result = blockhashSchema.safeParse("not-a-valid-blockhash");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid Solana blockhash");
    }
  });

  it("should work with safeParse", () => {
    const validResult = blockhashSchema.safeParse(VALID_BLOCKHASH);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data).toBe(blockhash(VALID_BLOCKHASH));
    }

    const invalidResult = blockhashSchema.safeParse("invalid");
    expect(invalidResult.success).toBe(false);
  });

  it("should infer the correct TypeScript type", () => {
    // This is a compile-time test
    type InferredType = z.output<typeof blockhashSchema>;
    const testBlockhash: InferredType = blockhash(VALID_BLOCKHASH);

    expect(testBlockhash).toBeDefined();
  });
});
