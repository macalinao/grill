import type { TokenInfo } from "@macalinao/token-utils";
import { createTokenInfo } from "@macalinao/token-utils";
import { tokenMetadataSchema } from "@macalinao/zod-solana";
import type { Address } from "@solana/kit";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";

/**
 * Generates a query key for token info queries
 * @param mint - The mint address
 * @param metadataAccountAddress - The metadata account address (optional)
 * @returns Query key tuple
 */
export function createTokenInfoQueryKey(
  mint: Address | null | undefined,
  metadataAccountAddress: Address | null | undefined,
) {
  return [
    GRILL_HOOK_CLIENT_KEY,
    "tokenInfo",
    mint,
    metadataAccountAddress,
  ] as const;
}

/**
 * Creates placeholder token info from available on-chain data
 * @param mint - The mint address
 * @param decimals - The token decimals
 * @param onChainName - The name from token metadata account
 * @param onChainSymbol - The symbol from token metadata account
 * @returns Placeholder TokenInfo or null
 */
export function createPlaceholderTokenInfo({
  mint,
  decimals,
  onChainName,
  onChainSymbol,
}: {
  mint: Address | null | undefined;
  decimals: number | undefined;
  onChainName: string | undefined;
  onChainSymbol: string | undefined;
}): TokenInfo | null {
  if (!mint || decimals === undefined) {
    return null;
  }

  // Create token info with just on-chain data (no image)
  const metadataAccountData =
    onChainName && onChainSymbol
      ? { name: onChainName, symbol: onChainSymbol }
      : null;

  return createTokenInfo({
    mint,
    mintAccount: { decimals },
    metadataAccount: metadataAccountData,
    metadataUriJson: null,
  });
}

/**
 * Fetches and creates token info from on-chain data and metadata URI
 * @param mint - The mint address
 * @param decimals - The token decimals from mint account
 * @param uri - The metadata URI from token metadata account
 * @param onChainName - The name from token metadata account
 * @param onChainSymbol - The symbol from token metadata account
 * @returns TokenInfo or null if data is insufficient
 */
export async function fetchTokenInfo({
  mint,
  decimals,
  uri,
  onChainName,
  onChainSymbol,
}: {
  mint: Address | null | undefined;
  decimals: number | undefined;
  uri: string | undefined;
  onChainName: string | undefined;
  onChainSymbol: string | undefined;
}): Promise<TokenInfo | null> {
  if (!mint || decimals === undefined) {
    return null;
  }

  // Prepare metadata account data
  let metadataAccountData: { name: string; symbol: string } | null =
    onChainName && onChainSymbol
      ? { name: onChainName, symbol: onChainSymbol }
      : null;

  // Prepare metadata URI JSON data
  let metadataUriJson: { image: string } | null = null;

  // Try to fetch metadata from URI if available
  if (uri && metadataAccountData) {
    try {
      const response = await fetch(uri);
      if (response.ok) {
        const json = (await response.json()) as unknown;
        const result = tokenMetadataSchema.safeParse(json);

        if (result.success) {
          // Override with data from URI JSON
          metadataAccountData = {
            name: result.data.name,
            symbol: result.data.symbol,
          };
          if (result.data.image) {
            metadataUriJson = { image: result.data.image };
          }
        } else {
          console.error("Invalid token metadata:", result.error);
        }
      }
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
  }

  // Create token info with all collected data
  return createTokenInfo({
    mint,
    mintAccount: { decimals },
    metadataAccount: metadataAccountData,
    metadataUriJson,
  });
}
