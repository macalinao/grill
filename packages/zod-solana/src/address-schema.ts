import type { Address } from "@solana/kit";
import { address } from "@solana/kit";
import { z } from "zod";

/**
 * A Zod schema for Solana addresses.
 * Validates that a string is a valid Solana address and transforms it to an Address type.
 * Compatible with both Zod v3 and v4.
 */
export const addressSchema: z.ZodType<Address, string> = z
  .string()
  .transform((val, ctx) => {
    try {
      return address(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Invalid Solana address",
      });
      return z.NEVER;
    }
  });
