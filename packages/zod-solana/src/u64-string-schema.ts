import * as z from "zod";
import { U64_MAX } from "./constants.js";

/**
 * A Zod schema for u64 values as strings.
 * Validates that a string represents a valid u64 value (0 to 2^64-1).
 * Returns the value as a string to preserve precision for large numbers.
 */
export const u64StringSchema = z.string().refine(
  (val) => {
    // Check for empty string
    if (val === "") {
      return false;
    }

    // Check for whitespace
    if (val !== val.trim()) {
      return false;
    }

    // Check for plus sign, hex prefix, binary prefix, octal prefix
    if (
      val.startsWith("+") ||
      val.startsWith("0x") ||
      val.startsWith("0X") ||
      val.startsWith("0b") ||
      val.startsWith("0B") ||
      val.startsWith("0o") ||
      val.startsWith("0O")
    ) {
      return false;
    }

    // Check if it's a valid decimal number string (only digits)
    if (!/^\d+$/.test(val)) {
      return false;
    }

    try {
      const num = BigInt(val);
      return num >= 0n && num <= U64_MAX;
    } catch {
      return false;
    }
  },
  {
    message: `Value must be a valid u64 (0 to ${String(U64_MAX)})`,
  },
);
