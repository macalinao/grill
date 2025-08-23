import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  createPlaceholderTokenInfo,
  createTokenInfoQueryKey,
  fetchTokenInfo,
} from "../utils/token-info-helpers.js";
import { useMintAccount } from "./use-mint-account.js";
import { useTokenMetadataAccount } from "./use-token-metadata-account.js";

/**
 * Hook for fetching comprehensive token information for a single mint
 *
 * This hook combines data from multiple sources to provide complete token information:
 * - Mint account data (decimals, supply, authorities)
 * - Token metadata account (name, symbol, URI)
 * - Off-chain metadata from URI (image, extended metadata)
 *
 * The hook provides placeholder data immediately from on-chain sources (name, symbol, decimals)
 * while fetching the complete metadata including images from the URI in the background.
 *
 * @param mint - The mint address to fetch token info for
 * @returns UseQueryResult containing TokenInfo or null
 *
 * @example
 * ```tsx
 * function TokenDisplay({ mint }: { mint: Address }) {
 *   const { data: tokenInfo, isLoading } = useTokenInfo({ mint });
 *
 *   if (isLoading) return <div>Loading token info...</div>;
 *   if (!tokenInfo) return <div>Token not found</div>;
 *
 *   return (
 *     <div>
 *       <img src={tokenInfo.logoURI} alt={tokenInfo.name} />
 *       <h2>{tokenInfo.name} ({tokenInfo.symbol})</h2>
 *       <p>Decimals: {tokenInfo.decimals}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenInfo({
  mint,
}: {
  mint: Address | null | undefined;
}): UseQueryResult<TokenInfo | null> {
  const { data: metadataAccount, pda } = useTokenMetadataAccount({ mint });
  const { data: mintAccount } = useMintAccount({ address: mint });

  const uri = metadataAccount?.data.data.uri;
  const decimals = mintAccount?.data.decimals;
  const onChainName = metadataAccount?.data.data.name;
  const onChainSymbol = metadataAccount?.data.data.symbol;

  return useQuery<TokenInfo | null>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: createTokenInfoQueryKey(mint, pda),
    queryFn: () =>
      fetchTokenInfo({
        mint,
        decimals,
        uri,
        onChainName,
        onChainSymbol,
      }),
    placeholderData: () =>
      createPlaceholderTokenInfo({
        mint,
        decimals,
        onChainName,
        onChainSymbol,
      }),
    enabled:
      !!mint && mintAccount !== undefined && metadataAccount !== undefined,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
