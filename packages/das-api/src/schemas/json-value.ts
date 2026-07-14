import type { JsonObject, JsonValue } from "../types/json-value.js";
import * as z from "zod";

/**
 * Zod schema for a {@link JsonObject}.
 *
 * Recursive; defined via `z.lazy` so it can reference {@link jsonValueSchema}.
 */
export const jsonObjectSchema: z.ZodType<JsonObject> = z.lazy(() =>
  z.record(z.string(), jsonValueSchema),
);

/**
 * Zod schema for any {@link JsonValue}.
 *
 * Used for the open-ended, provider-specific fields of a DAS response (plugins,
 * token extensions, SPL-20 data) where the shape is not known ahead of time but
 * the value is guaranteed to be JSON.
 */
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    jsonObjectSchema,
  ]),
);
