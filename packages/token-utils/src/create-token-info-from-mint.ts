import type { Address } from "@solana/kit";
import type { TokenInfo } from "./types.js";

/**
 * Creates a TokenInfo from a mint with decimals.
 * Generates a symbol from the first 4 characters of the mint address
 * and a name as "Token <first4>".
 * @param mint - Mint object with address and decimals
 * @returns TokenInfo object
 */
export function createTokenInfoFromMint<
  TMint extends string = string,
  TDecimals extends number = number,
>(mint: {
  address: Address<TMint>;
  data: { decimals: TDecimals };
}): TokenInfo<TMint, TDecimals> {
  const mintStr = mint.address.toString();
  const first4 = mintStr.slice(0, 4);
  return {
    mint: mint.address,
    symbol: first4,
    name: `Token ${first4}`,
    decimals: mint.data.decimals,
  };
}
