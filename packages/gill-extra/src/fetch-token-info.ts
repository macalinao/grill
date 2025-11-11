import type { Metadata } from "@macalinao/clients-token-metadata";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Mint } from "@solana-program/token";
import type { AccountInfo } from "./types.js";
import { createTokenInfo } from "@macalinao/token-utils";
import { tokenMetadataSchema } from "@macalinao/zod-solana";

export interface FetchTokenInfoParams {
  mint: AccountInfo<Pick<Mint, "decimals">>;
  metadata: Metadata | null;
  /**
   * Whether to fetch from the certified token list as a fallback.
   * Defaults to true for backwards compatibility.
   */
  fetchFromCertifiedTokenList?: boolean;
}

/**
 * Fetches and constructs TokenInfo from Metadata and Mint accounts
 * @param params - Object containing mint address, mint account, and optional metadata
 * @returns TokenInfo or null if data is insufficient
 */
export async function fetchTokenInfo({
  mint,
  metadata,
  fetchFromCertifiedTokenList = true,
}: FetchTokenInfoParams): Promise<TokenInfo | null> {
  const uri = metadata?.data.uri;
  const decimals = mint.data.decimals;

  // Prepare metadata account data
  let metadataAccountData: { name: string; symbol: string } | null = metadata
    ? {
        name: metadata.data.name,
        symbol: metadata.data.symbol,
      }
    : null;

  // Prepare metadata URI JSON data
  let metadataUriJson: { image: string } | null = null;

  // Try to fetch metadata from URI if available
  if (uri && metadataAccountData) {
    try {
      const response = await fetch(uri);
      if (response.ok) {
        const contentType = response.headers.get("content-type");

        // If the URI is an image, use it directly as the image URI
        if (contentType?.startsWith("image")) {
          metadataUriJson = { image: uri };
        } else {
          // Otherwise, try to parse it as JSON
          const result = tokenMetadataSchema.safeParse(await response.json());

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
      }
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
  }

  // Create token info with all collected data
  const tokenInfo = createTokenInfo({
    mint: mint.address,
    mintAccount: { decimals },
    metadataAccount: metadataAccountData,
    metadataUriJson,
  });

  // Fallback: Try to fetch from certified token list if no icon URL and enabled
  if (fetchFromCertifiedTokenList && !tokenInfo.iconURL) {
    const certifiedTokenInfoUrl = `https://raw.githubusercontent.com/CLBExchange/certified-token-list/refs/heads/master/101/${mint.address}.json`;
    try {
      const response = await fetch(certifiedTokenInfoUrl);
      if (response.ok) {
        const data = (await response.json()) as {
          name: string;
          symbol: string;
          logoURI: string;
        };
        if (!tokenInfo.name) {
          tokenInfo.name = data.name;
        }
        if (!tokenInfo.symbol) {
          tokenInfo.symbol = data.symbol;
        }
        tokenInfo.iconURL = data.logoURI;
      }
    } catch (error) {
      console.warn("Could not fetch certified token info:", error);
    }
  }

  return tokenInfo;
}
