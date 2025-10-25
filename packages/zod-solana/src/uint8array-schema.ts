import * as z from "zod";
import { u8Schema } from "./u8-schema.js";

/**
 * A Zod schema for Uint8Array.
 * Accepts an array of numbers and transforms it to a Uint8Array.
 */
export const uint8ArraySchema: z.ZodType<Uint8Array> = z
  .array(u8Schema)
  .transform((arr) => new Uint8Array(arr));

/**
 * A Zod schema for JSON-encoded Uint8Array.
 * Accepts a JSON string, parses it, and transforms to Uint8Array.
 */
export const jsonUint8ArraySchema: z.ZodType<Uint8Array> = z
  .string()
  .transform((str) => {
    try {
      const parsed: unknown = JSON.parse(str);
      return parsed;
    } catch (error) {
      throw new Error(
        `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  })
  .pipe(uint8ArraySchema);
