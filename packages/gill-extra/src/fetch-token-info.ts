import type { Metadata } from "@macalinao/clients-token-metadata";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Mint } from "@solana-program/token";
import type { AccountInfo } from "./types.js";
import { createTokenInfo } from "@macalinao/token-utils";
import { tokenMetadataSchema } from "@macalinao/zod-solana";

export interface FetchTokenInfoParams {
  mint: AccountInfo<Pick<Mint, "decimals">>;
  metadata: Metadata | null;
}

/**
 * Fetches and constructs TokenInfo from Metadata and Mint accounts
 * @param params - Object containing mint address, mint account, and optional metadata
 * @returns TokenInfo or null if data is insufficient
 */
export async function fetchTokenInfo({
  mint,
  metadata,
}: FetchTokenInfoParams): Promise<TokenInfo | null> {
  const uri = metadata?.data.uri;
  const decimals = mint.data.decimals;
  const onChainName = metadata?.data.name;
  const onChainSymbol = metadata?.data.symbol;

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
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
  }

  // Create token info with all collected data
  return createTokenInfo({
    mint: mint.address,
    mintAccount: { decimals },
    metadataAccount: metadataAccountData,
    metadataUriJson,
  });
}
