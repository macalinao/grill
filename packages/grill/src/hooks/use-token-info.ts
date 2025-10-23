import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { fetchTokenInfo } from "@macalinao/gill-extra";
import { useQuery } from "@tanstack/react-query";
import { useMintAccount } from "../accounts/mint.js";
import { useGrillContext } from "../contexts/grill-context.js";
import { createTokenInfoQueryKey } from "../query-keys.js";
import { useTokenMetadataAccount } from "./use-token-metadata-account.js";

export interface UseTokenInfoInput {
  /**
   * Mint address of the token to get the info of.
   */
  mint: Address | null | undefined;
}

/**
 * Hook for getting the {@link TokenInfo} for a given mint address.
 * @param param0
 * @returns
 */
export function useTokenInfo({
  mint,
}: UseTokenInfoInput): UseQueryResult<TokenInfo | null> {
  const { staticTokenInfo } = useGrillContext();
  const { data: metadataAccount } = useTokenMetadataAccount({ mint });
  const { data: mintAccount } = useMintAccount({ address: mint });

  // Check for static token info
  const staticInfo = mint ? staticTokenInfo.get(mint) : undefined;

  return useQuery<TokenInfo | null>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: createTokenInfoQueryKey(mint),
    queryFn: async () => {
      if (!mint) {
        return null;
      }

      // Return static token info if available
      if (staticInfo) {
        return staticInfo;
      }

      if (!mintAccount) {
        return null;
      }

      return fetchTokenInfo({
        mint: mintAccount,
        metadata: metadataAccount?.data ?? null,
      });
    },
    enabled:
      !!mint &&
      (staticInfo !== undefined ||
        (mintAccount !== undefined && metadataAccount !== undefined)),
    staleTime: staticInfo ? Number.POSITIVE_INFINITY : 5 * 60 * 1000, // Static info never goes stale
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    placeholderData: staticInfo ?? undefined,
  });
}
