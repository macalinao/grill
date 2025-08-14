import type { TokenAmount } from "./types.js";

/**
 * Convert a TokenAmount to a bigint representing the raw token amount
 * @param tokenAmount - The TokenAmount to convert
 * @returns The raw token amount as a bigint
 * @example
 * ```ts
 * // For a token with 9 decimals (like SOL)
 * const amount = parseTokenAmount(token, "1.5");
 * const bigintAmount = tokenAmountToBigInt(amount); // 1500000000n
 *
 * // For a token with 6 decimals (like USDC)
 * const usdcAmount = parseTokenAmount(usdcToken, "100.25");
 * const bigintUsdcAmount = tokenAmountToBigInt(usdcAmount); // 100250000n
 * ```
 */
export function tokenAmountToBigInt<
  TMint extends string = string,
  TDecimals extends number = number,
>(tokenAmount: TokenAmount<TMint, TDecimals>): bigint {
  // The dnum format is [value, decimals] where value is already the raw amount
  return tokenAmount.amount[0];
}
