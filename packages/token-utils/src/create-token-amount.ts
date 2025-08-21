import type { TokenAmount, TokenInfo } from "./types.js";

/**
 * Creates a TokenAmount from a TokenInfo and a bigint value.
 *
 * @param token - The token information
 * @param value - The token amount as a bigint (in smallest units)
 * @returns A TokenAmount object
 */
export function createTokenAmount<
  TMint extends string = string,
  TDecimals extends number = number,
>(
  token: TokenInfo<TMint, TDecimals>,
  value: bigint,
): TokenAmount<TMint, TDecimals> {
  return {
    token,
    amount: [value, token.decimals] as const,
  };
}
