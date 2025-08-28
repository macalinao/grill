import type { TokenInfo } from "./types.js";
import { address } from "@solana/kit";
import { createTokenInfoFromMint } from "./create-token-info-from-mint.js";

/**
 * Creates a test TokenInfo for use in tests.
 * This is a convenience wrapper around createTokenInfoFromMint.
 * @param addressStr - Address string for the token mint
 * @param decimals - Number of decimals for the token
 * @returns TokenInfo object for testing
 */
export function createTestTokenInfo<
  TMint extends string = string,
  TDecimals extends number = number,
>(addressStr: TMint, decimals: TDecimals): TokenInfo<TMint, TDecimals> {
  return createTokenInfoFromMint({
    address: address(addressStr),
    data: { decimals },
  });
}
