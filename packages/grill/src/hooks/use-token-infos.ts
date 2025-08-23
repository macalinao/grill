import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import { useQueries } from "@tanstack/react-query";
import {
  createPlaceholderTokenInfo,
  createTokenInfoQueryKey,
  fetchTokenInfo,
} from "../utils/token-info-helpers.js";
import { useMintAccounts } from "./use-mint-accounts.js";
import { useTokenMetadataAccounts } from "./use-token-metadata-accounts.js";

/**
 * Result type for useTokenInfos hook
 */
export interface UseTokenInfosResult {
  /** Whether any of the queries are still loading */
  isLoading: boolean;
  /** Array of token infos corresponding to the input mints array */
  data: (TokenInfo | null)[];
  /** Whether all queries have been fetched at least once */
  isSuccess: boolean;
  /** Whether any query has an error */
  isError: boolean;
}

/**
 * Hook for fetching comprehensive token information for multiple mints
 *
 * This hook efficiently batches requests for multiple tokens and combines data from:
 * - Mint accounts (decimals, supply, authorities)
 * - Token metadata accounts (name, symbol, URI)
 * - Off-chain metadata from URIs (images, extended metadata)
 *
 * Features:
 * - Automatic request batching via DataLoader for optimal RPC performance
 * - Placeholder data from on-chain sources while fetching complete metadata
 * - Parallel fetching of off-chain metadata for all tokens
 * - Maintains order - results array corresponds to input mints array
 *
 * @param mints - Array of mint addresses to fetch token info for
 * @returns UseTokenInfosResult with loading state and array of token infos
 *
 * @example
 * ```tsx
 * function TokenList({ mints }: { mints: Address[] }) {
 *   const { data: tokenInfos, isLoading } = useTokenInfos({ mints });
 *
 *   if (isLoading) return <div>Loading tokens...</div>;
 *
 *   return (
 *     <div>
 *       {tokenInfos.map((tokenInfo, index) => {
 *         if (!tokenInfo) return <div key={index}>Token not found</div>;
 *
 *         return (
 *           <div key={tokenInfo.address}>
 *             <img src={tokenInfo.logoURI} alt={tokenInfo.name} />
 *             <span>{tokenInfo.name} ({tokenInfo.symbol})</span>
 *             <span>{tokenInfo.decimals} decimals</span>
 *           </div>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Fetch token info for USDC, USDT, and SOL
 * const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address;
 * const usdtMint = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" as Address;
 * const solMint = "So11111111111111111111111111111111111111112" as Address;
 *
 * function StablecoinList() {
 *   const { data: tokens, isLoading } = useTokenInfos({
 *     mints: [usdcMint, usdtMint, solMint]
 *   });
 *
 *   // tokens[0] = USDC info
 *   // tokens[1] = USDT info
 *   // tokens[2] = SOL info
 * }
 * ```
 */
export function useTokenInfos({
  mints,
}: {
  mints: (Address | null | undefined)[];
}): UseTokenInfosResult {
  const mintAccountsResult = useMintAccounts({ addresses: mints });
  const metadataAccountsResult = useTokenMetadataAccounts({ mints });

  return useQueries({
    queries: mints.map((mint, index) => {
      const mintAccount = mintAccountsResult.data[index];
      const metadataAccount = metadataAccountsResult.data[index];
      const metadataAccountAddress = metadataAccountsResult.pdaAddresses[index];

      const uri = metadataAccount?.data.data.uri;
      const decimals = mintAccount?.data.decimals;
      const onChainName = metadataAccount?.data.data.name;
      const onChainSymbol = metadataAccount?.data.data.symbol;

      return {
        queryKey: createTokenInfoQueryKey(mint, metadataAccountAddress),
        queryFn: (): Promise<TokenInfo | null> =>
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
      };
    }),
    combine: (results) => {
      return {
        isLoading: results.some((result) => result.isLoading),
        data: results.map((result) => result.data ?? null),
        isSuccess: results.every((result) => result.isSuccess),
        isError: results.some((result) => result.isError),
      };
    },
  });
}
