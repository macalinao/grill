/**
 * Any value representable in JSON.
 *
 * Used instead of `unknown` for open-ended, provider-specific fields (e.g. the
 * arbitrary keys of off-chain metadata) so that such fields stay traversable and
 * type-checked rather than opaque.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | JsonObject;

/**
 * A JSON object with string keys and {@link JsonValue} values.
 */
export interface JsonObject {
  [key: string]: JsonValue;
}
