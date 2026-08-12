import type { Address } from "@solana/kit";
import type * as z from "zod";
import { address } from "@solana/kit";
import { createBrandedStringSchema } from "./create-branded-string-schema.js";

/**
 * A Zod schema for Solana addresses.
 * Validates that a string is a valid Solana address and transforms it to an Address type.
 * Compatible with both Zod v3 and v4.
 */
export const addressSchema: z.ZodType<Address, string> =
  createBrandedStringSchema(address, "Invalid Solana address");
