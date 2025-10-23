import type { Decoder } from "gill";

/**
 * A decoder with a human-readable name for identification and serialization purposes
 */
export interface NamedDecoder<T extends object = object> {
  /**
   * The decoder instance
   */
  decoder: Decoder<T>;
  /**
   * A human-readable name for the decoder
   */
  name: string;
}
