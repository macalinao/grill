import type { TokenAmount, TokenInfo } from "./types.js";
import * as dnum from "dnum";

/**
 * Parse a string amount into a TokenAmount
 * @param token - The token information
 * @param amountHuman - The amount as a string (e.g. "1.5", "100", "0.000001") or number
 * @returns A TokenAmount with the parsed dnum representation
 */
export function parseTokenAmount<
  TMint extends string = string,
  TDecimals extends number = number,
>(
  token: TokenInfo<TMint, TDecimals>,
  amountHuman: string | number,
): TokenAmount<TMint, TDecimals> {
  // Handle edge cases
  let cleanedAmount: string | number = amountHuman;

  if (typeof amountHuman === "string") {
    // Trim whitespace
    cleanedAmount = amountHuman.trim();

    // Handle empty string
    if (cleanedAmount === "") {
      cleanedAmount = "0";
    }

    // Remove underscores (common in large numbers)
    cleanedAmount = cleanedAmount.replace(/_/g, "");

    // Remove commas (common in formatted numbers)
    cleanedAmount = cleanedAmount.replace(/,/g, "");
  } else if (typeof amountHuman === "number") {
    // Handle NaN
    if (Number.isNaN(amountHuman)) {
      cleanedAmount = "0";
    }
    // Handle Infinity
    else if (!Number.isFinite(amountHuman)) {
      throw new Error(
        `Cannot parse infinite value: ${amountHuman.toLocaleString()}`,
      );
    }
  }

  // Parse the string amount to a dnum
  const amount = dnum.from(cleanedAmount, token.decimals);

  return {
    token,
    amount: amount as readonly [value: bigint, decimals: TDecimals],
  };
}
