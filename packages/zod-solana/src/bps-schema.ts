import * as z from "zod";

/**
 * Zod schema for basis points (0-10000)
 */
export const bpsSchema: z.ZodNumber = z
  .number()
  .int()
  .min(0)
  .max(10000)
  .describe("Basis points (0-10000)");
