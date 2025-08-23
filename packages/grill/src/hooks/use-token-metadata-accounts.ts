import type { Metadata } from "@macalinao/clients-token-metadata";
import { getMetadataDecoder } from "@macalinao/clients-token-metadata";
import type { Address } from "@solana/kit";
import type { UseAccountsResult } from "./use-accounts.js";
import { useAccounts } from "./use-accounts.js";
import { useTokenMetadataPdas } from "./use-token-metadata-pdas.js";

/**
 * Hook for fetching and decoding multiple token metadata accounts
 * @param mints - Array of mint addresses to fetch metadata for
 * @returns Array of metadata accounts and their PDAs
 */
export function useTokenMetadataAccounts({
  mints,
}: {
  mints: (Address | null | undefined)[];
}): UseAccountsResult<Metadata> & {
  pdaAddresses: (Address | null)[];
} {
  // Calculate all PDAs using the new hook
  const { data: pdaAddresses } = useTokenMetadataPdas({ mints });

  const accountsResult = useAccounts({
    addresses: pdaAddresses,
    decoder: getMetadataDecoder(),
  });

  return {
    ...accountsResult,
    pdaAddresses,
  };
}
