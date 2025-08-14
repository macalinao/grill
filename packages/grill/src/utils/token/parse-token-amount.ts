import * as dnum from "dnum";
import type { TokenAmount, TokenInfo } from "./types.js";

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
  // Parse the string amount to a dnum
  const amount = dnum.from(amountHuman, token.decimals);

  return {
    token,
    amount: amount as readonly [value: bigint, decimals: TDecimals],
  };
}
