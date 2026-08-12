import type { Blockhash } from "@solana/kit";
import { blockhash } from "@solana/kit";
import * as z from "zod";

/**
 * A Zod schema for Solana blockhashes.
 * Validates that a string is a valid base58-encoded 32-byte blockhash and
 * transforms it to a Blockhash type.
 * Compatible with both Zod v3 and v4.
 */
export const blockhashSchema: z.ZodType<Blockhash, string> = z
  .string()
  .transform((val, ctx) => {
    try {
      return blockhash(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Invalid Solana blockhash",
      });
      return z.NEVER;
    }
  });
