import type { Signature } from "@solana/kit";
import type * as z from "zod";
import { signature } from "@solana/kit";
import { createBrandedStringSchema } from "./create-branded-string-schema.js";

/**
 * A Zod schema for Solana transaction signatures.
 * Validates that a string is a valid base58-encoded 64-byte signature and
 * transforms it to a Signature type.
 */
export const signatureSchema: z.ZodType<Signature, string> =
  createBrandedStringSchema(signature, "Invalid Solana signature");
