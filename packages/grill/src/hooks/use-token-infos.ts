import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import { fetchTokenInfo } from "@macalinao/gill-extra";
import { useQueries } from "@tanstack/react-query";
import { useGrillContext } from "../contexts/grill-context.js";
import { createTokenInfoQueryKey } from "../query-keys.js";
import { useMintAccounts } from "./use-mint-account.js";
import { useTokenMetadataAccounts } from "./use-token-metadata-account.js";

export interface UseTokenInfosInput {
  /**
   * Mint addresses of the tokens to get the info of.
   */
  mints: (Address | null | undefined)[] | null | undefined;
}

export type UseTokenInfosResult =
  | {
      isLoading: true;
      data: (TokenInfo | null | undefined)[];
      mints: (Address | null | undefined)[] | null | undefined;
    }
  | {
      isLoading: false;
      data: (TokenInfo | null)[];
      mints: (Address | null | undefined)[] | null | undefined;
    };

/**
 * Hook for getting the {@link TokenInfo} for multiple mint addresses.
 * @param param0
 * @returns
 */
export function useTokenInfos({
  mints,
}: UseTokenInfosInput): UseTokenInfosResult {
  const { staticTokenInfo } = useGrillContext();

  // Filter out null/undefined mints for account fetching
  const validMints = mints?.filter((mint): mint is Address => !!mint) ?? [];

  const metadataAccountsResult = useTokenMetadataAccounts({
    mints: validMints.length > 0 ? validMints : null,
  });
  const mintAccountsResult = useMintAccounts({
    addresses: validMints.length > 0 ? validMints : [],
  });

  // Create a map for easy lookup
  const metadataMap = new Map<
    Address,
    (typeof metadataAccountsResult.data)[number]
  >();
  const mintMap = new Map<Address, (typeof mintAccountsResult.data)[number]>();

  if (!(metadataAccountsResult.isLoading || mintAccountsResult.isLoading)) {
    validMints.forEach((mint, index) => {
      if (metadataAccountsResult.data[index]) {
        metadataMap.set(mint, metadataAccountsResult.data[index]);
      }
      if (mintAccountsResult.data[index]) {
        mintMap.set(mint, mintAccountsResult.data[index]);
      }
    });
  }

  const result = useQueries({
    queries: (mints ?? []).map((mint) => {
      const metadataAccount = mint ? metadataMap.get(mint) : undefined;
      const mintAccount = mint ? mintMap.get(mint) : undefined;

      // Check for static token info
      const staticInfo = mint ? staticTokenInfo.get(mint) : undefined;

      return {
        queryKey: createTokenInfoQueryKey(mint),
        queryFn: async (): Promise<TokenInfo | null> => {
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
      };
    }),
    combine: (results): UseTokenInfosResult => {
      const isLoading = results.some(
        (result) => result.isLoading || result.data === undefined,
      );
      if (isLoading) {
        return {
          isLoading: true,
          data: results.map((result) => result.data),
          mints,
        };
      }
      return {
        isLoading: false,
        data: results
          .map((result) => result.data)
          .filter((r): r is TokenInfo | null => r !== undefined),
        mints,
      };
    },
  });

  return result;
}
