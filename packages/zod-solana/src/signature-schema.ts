import type { Signature } from "@solana/kit";
import { signature } from "@solana/kit";
import * as z from "zod";

/**
 * A Zod schema for Solana transaction signatures.
 * Validates that a string is a valid base58-encoded 64-byte signature and
 * transforms it to a Signature type.
 * Compatible with both Zod v3 and v4.
 */
export const signatureSchema: z.ZodType<Signature, string> = z
  .string()
  .transform((val, ctx) => {
    try {
      return signature(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Invalid Solana signature",
      });
      return z.NEVER;
    }
  });
