import * as z from "zod";
import { U32_MAX } from "./constants.js";

/**
 * A Zod schema for u32 values.
 * Validates that a number is between 0 and 4294967295 (inclusive).
 */
export const u32Schema: z.ZodNumber = z
  .number()
  .int("Value must be an integer")
  .min(0, "Value must be at least 0")
  .max(U32_MAX, `Value must be at most ${String(U32_MAX)}`);
