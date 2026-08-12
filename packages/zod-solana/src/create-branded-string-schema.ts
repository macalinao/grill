import * as z from "zod";

/**
 * Builds a Zod schema around one of @solana/kit's branded-string constructors.
 *
 * The constructor validates its input and throws on anything malformed, so the
 * schema catches that and reports `message` as a custom issue, returning
 * `z.NEVER` to abort the transform.
 *
 * Internal helper -- shared by the address, signature, and blockhash schemas,
 * each of which stays in its own module so consumers only pull in the ones they
 * actually use.
 */
export const createBrandedStringSchema = <T extends string>(
  toBranded: (value: string) => T,
  message: string,
): z.ZodType<T, string> =>
  z.string().transform((val, ctx) => {
    try {
      return toBranded(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message,
      });
      return z.NEVER;
    }
  });
