import * as z from "zod";
import { U8_MAX } from "./constants.js";

/**
 * A Zod schema for u8 values.
 * Validates that a number is between 0 and 255 (inclusive).
 */
export const u8Schema: z.ZodNumber = z
  .number()
  .int("Value must be an integer")
  .min(0, "Value must be at least 0")
  .max(U8_MAX, `Value must be at most ${String(U8_MAX)}`);
