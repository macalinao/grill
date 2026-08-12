import type { Metadata } from "@macalinao/clients-token-metadata";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Mint } from "@solana-program/token";
import type { Logger } from "./logger.js";
import type { TokenMetadataValidator } from "./token-metadata-validator.js";
import type { AccountInfo } from "./types.js";
import { createTokenInfo } from "@macalinao/token-utils";
import { defaultLogger } from "./logger.js";
import { defaultTokenMetadataValidator } from "./token-metadata-validator.js";

export interface FetchTokenInfoParams {
  mint: AccountInfo<Pick<Mint, "decimals">>;
  metadata: Metadata | null;
  /**
   * Whether to fetch from the certified token list as a fallback.
   * Defaults to true for backwards compatibility.
   */
  fetchFromCertifiedTokenList?: boolean | undefined;
  /**
   * Validates the JSON fetched from the token's metadata URI.
   *
   * Defaults to {@link defaultTokenMetadataValidator}, a dependency-free
   * shallow check. Pass `zodTokenMetadataValidator` from
   * `@macalinao/zod-solana` to validate the full Metaplex schema instead.
   */
  validateMetadata?: TokenMetadataValidator | undefined;
  /**
   * Logger used for metadata fetch failures. Defaults to {@link defaultLogger}.
   */
  logger?: Logger | undefined;
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
  validateMetadata = defaultTokenMetadataValidator,
  logger = defaultLogger,
}: FetchTokenInfoParams): Promise<TokenInfo> {
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
          const parsed = validateMetadata(await response.json());

          if (parsed) {
            // Override with data from URI JSON
            metadataAccountData = {
              name: parsed.name,
              symbol: parsed.symbol,
            };
            if (parsed.image) {
              metadataUriJson = { image: parsed.image };
            }
          } else {
            logger.error("Invalid token metadata at URI:", uri);
          }
        }
      }
    } catch (error) {
      logger.error("Error fetching token info:", error);
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
      logger.warn("Could not fetch certified token info:", error);
    }
  }

  return tokenInfo;
}
