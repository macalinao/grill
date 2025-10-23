import type { Address } from "@solana/kit";
import type { TokenInfo } from "./types.js";

export interface CreateTokenInfoParams<
  TMint extends string = string,
  TDecimals extends number = number,
> {
  /**
   * The mint address of the token
   */
  mint: Address<TMint>;
  /**
   * The mint account data containing decimals
   */
  mintAccount: { decimals: TDecimals };
  /**
   * The metadata account data containing name and symbol, or null if not available
   */
  metadataAccount: { name: string; symbol: string } | null;
  /**
   * The metadata URI JSON containing image URL, or null if not available
   */
  metadataUriJson: { image: string } | null;
}

const addressToSymbol = (address: Address) => {
  const symbolChars = address
    .toUpperCase()
    .split("")
    .filter((char) => /[A-Z0-9]/.test(char))
    .slice(0, 4);
  return symbolChars.length >= 4 ? symbolChars.join("") : address.slice(0, 4);
};

/**
 * Create a TokenInfo object from on-chain and off-chain data.
 * If no metadata account is provided, derives name and symbol from the mint address.
 *
 * @param params - The parameters for creating the TokenInfo
 * @returns A TokenInfo object
 *
 * @example
 * ```ts
 * // With metadata
 * const tokenInfo = createTokenInfo({
 *   mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
 *   mintAccount: { decimals: 6 },
 *   metadataAccount: { name: "USD Coin", symbol: "USDC" },
 *   metadataUriJson: { image: "https://example.com/usdc.png" }
 * });
 *
 * // Without metadata (derives from address)
 * const unknownToken = createTokenInfo({
 *   mint: address("SomeTokenMint11111111111111111111111111111"),
 *   mintAccount: { decimals: 9 },
 *   metadataAccount: null,
 *   metadataUriJson: null
 * });
 * // Returns: { mint, name: "SomeTo...", symbol: "SOME", decimals: 9 }
 * ```
 */
export function createTokenInfo<
  TMint extends string = string,
  TDecimals extends number = number,
>({
  mint,
  mintAccount,
  metadataAccount,
  metadataUriJson,
}: CreateTokenInfoParams<TMint, TDecimals>): TokenInfo<TMint, TDecimals> {
  // If metadata account exists, use its name and symbol
  if (metadataAccount) {
    const tokenInfo: TokenInfo<TMint, TDecimals> = {
      mint,
      name: metadataAccount.name,
      symbol: metadataAccount.symbol || addressToSymbol(mint),
      decimals: mintAccount.decimals,
    };

    // Add icon URL if available from metadata URI JSON
    if (metadataUriJson?.image) {
      tokenInfo.iconURL = metadataUriJson.image;
    }

    return tokenInfo;
  }

  // If no metadata account, derive name and symbol from address
  const addressStr = mint.toString();

  // Take first 6 characters of the address for the short name
  const shortName = `${addressStr.slice(0, 6)}...`;

  const symbol = addressToSymbol(mint);

  return {
    mint,
    name: shortName,
    symbol,
    decimals: mintAccount.decimals,
  };
}
