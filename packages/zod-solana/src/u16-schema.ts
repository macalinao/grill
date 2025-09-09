import * as z from "zod";
import { U16_MAX } from "./constants.js";

/**
 * A Zod schema for u16 values.
 * Validates that a number is between 0 and 65535 (inclusive).
 */
export const u16Schema = z
  .number()
  .int("Value must be an integer")
  .min(0, "Value must be at least 0")
  .max(U16_MAX, `Value must be at most ${String(U16_MAX)}`);
