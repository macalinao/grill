import * as dnum from "dnum";
import type { TokenInfo } from "../token.js";

/**
 * Helper function to format token amount for display using dnum
 */
export function formatTokenAmount(
  amount: bigint | string | number,
  tokenInfoOrDecimals: TokenInfo | number,
): string {
  const decimals =
    typeof tokenInfoOrDecimals === "number"
      ? tokenInfoOrDecimals
      : tokenInfoOrDecimals.decimals;

  // Convert amount to dnum format [value, decimals]
  const dnumAmount: dnum.Dnum = [BigInt(amount), decimals];

  // Format the amount, removing trailing zeros
  return dnum.format(dnumAmount, {
    digits: decimals,
    trailingZeros: false,
  });
}
