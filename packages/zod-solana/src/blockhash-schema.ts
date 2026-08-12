import type { Blockhash } from "@solana/kit";
import type * as z from "zod";
import { blockhash } from "@solana/kit";
import { createBrandedStringSchema } from "./create-branded-string-schema.js";

/**
 * A Zod schema for Solana blockhashes.
 * Validates that a string is a valid base58-encoded 32-byte blockhash and
 * transforms it to a Blockhash type.
 * Compatible with both Zod v3 and v4.
 */
export const blockhashSchema: z.ZodType<Blockhash, string> =
  createBrandedStringSchema(blockhash, "Invalid Solana blockhash");
