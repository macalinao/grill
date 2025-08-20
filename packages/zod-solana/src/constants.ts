/**
 * Maximum value for an unsigned 8-bit integer (2^8 - 1).
 * Range: 0 to 255
 */
export const U8_MAX = 255;

/**
 * Maximum value for an unsigned 16-bit integer (2^16 - 1).
 * Range: 0 to 65,535
 */
export const U16_MAX = 65535;

/**
 * Maximum value for an unsigned 32-bit integer (2^32 - 1).
 * Range: 0 to 4,294,967,295
 */
export const U32_MAX = 4294967295;

/**
 * Maximum value for an unsigned 64-bit integer (2^64 - 1).
 * Range: 0 to 18,446,744,073,709,551,615
 * Note: This is a BigInt value to preserve precision beyond JavaScript's Number.MAX_SAFE_INTEGER.
 */
export const U64_MAX = 18446744073709551615n;
