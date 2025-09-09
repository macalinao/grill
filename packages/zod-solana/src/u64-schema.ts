import * as z from "zod";
import { U64_MAX } from "./constants.js";

/**
 * A Zod schema for u64 values.
 * Validates that a bigint is between 0 and 2^64-1 (inclusive).
 */
export const u64Schema = z
  .bigint()
  .min(0n, "Value must be at least 0")
  .max(U64_MAX, `Value must be at most ${String(U64_MAX)}`);
