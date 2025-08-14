import { tokenMetadataSchema } from "@macalinao/zod-solana";
import type { Address } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { GRILL_HOOK_CLIENT_KEY } from "../constants.js";
import type { TokenInfo } from "../token.js";
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
    queryKey: [
      GRILL_HOOK_CLIENT_KEY,
      "tokenInfo",
      mint,
      uri,
      decimals,
      onChainName,
      onChainSymbol,
    ] as const,
    queryFn: async () => {
      if (!mint || decimals === undefined || !onChainName || !onChainSymbol) {
        return null;
      }

      // If no URI, just return the on-chain data
      if (!uri) {
        return {
          mint,
          name: onChainName,
          symbol: onChainSymbol,
          decimals,
        };
      }

      try {
        const response = await fetch(uri);
        if (!response.ok) {
          // If fetch fails, return on-chain data
          return {
            mint,
            name: onChainName,
            symbol: onChainSymbol,
            decimals,
          };
        }
        const json = (await response.json()) as unknown;
        const result = tokenMetadataSchema.safeParse(json);

        if (result.success) {
          return {
            mint,
            name: result.data.name,
            symbol: result.data.symbol,
            decimals,
            iconURL: result.data.image,
          };
        }
        // If parsing fails, return on-chain data
        console.error("Invalid token metadata:", result.error);
        return {
          mint,
          name: onChainName,
          symbol: onChainSymbol,
          decimals,
        };
      } catch (error) {
        console.error("Error fetching token info:", error);
        // If error, return on-chain data
        return {
          mint,
          name: onChainName,
          symbol: onChainSymbol,
          decimals,
        };
      }
    },
    enabled:
      !!mint && decimals !== undefined && !!onChainName && !!onChainSymbol,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
