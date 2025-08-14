import * as dnum from "dnum";
import type { TokenInfo } from "./types.js";

/**
 * Parse a string amount into a dnum representation
 * @param amount - The amount as a string (e.g. "1.5", "100", "0.000001")
 * @param tokenInfoOrDecimals - Either a TokenInfo object or the number of decimals
 * @returns A dnum representation [value, decimals]
 */
export function parseTokenAmount(
  amount: string,
  tokenInfoOrDecimals: TokenInfo | number,
): dnum.Dnum {
  const decimals =
    typeof tokenInfoOrDecimals === "number"
      ? tokenInfoOrDecimals
      : tokenInfoOrDecimals.decimals;

  // Parse the string amount to a dnum
  return dnum.from(amount, decimals);
}
