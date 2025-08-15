import type { TokenInfo } from "@macalinao/token-utils";
import { createTokenInfo } from "@macalinao/token-utils";
import { tokenMetadataSchema } from "@macalinao/zod-solana";
import type { Address } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";
import { useMintAccount } from "./use-mint-account.js";
import { useTokenMetadataAccount } from "./use-token-metadata-account.js";

export function useTokenInfo({
  mint,
}: {
  mint: Address | null | undefined;
}): UseQueryResult<TokenInfo | null> {
  const { data: metadataAccount } = useTokenMetadataAccount({ mint });
  const { data: mintAccount } = useMintAccount({ address: mint });

  const uri = metadataAccount?.data.data.uri;
  const decimals = mintAccount?.data.decimals;
  const onChainName = metadataAccount?.data.data.name;
  const onChainSymbol = metadataAccount?.data.data.symbol;

  return useQuery<TokenInfo | null>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [GRILL_HOOK_CLIENT_KEY, "tokenInfo", mint] as const,
    queryFn: async () => {
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
    },
    enabled:
      !!mint && mintAccount !== undefined && metadataAccount !== undefined,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
