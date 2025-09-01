import type { BatchAccountsLoader } from "@macalinao/solana-batch-accounts-loader";
import type { QueryClient } from "@tanstack/react-query";
import type { Address } from "gill";
import { createAccountQueryKey } from "../query-keys.js";

/**
 * Refetches the accounts for the given addresses
 * @param queryClient - The query client to invalidate the accounts for
 * @param addresses - The addresses to invalidate the accounts for
 */
export const refetchAccounts = async ({
  queryClient,
  accountLoader,
  addresses,
}: {
  queryClient: QueryClient;
  accountLoader: BatchAccountsLoader;
  addresses: Address[];
}): Promise<void> => {
  // Clear the cache
  for (const address of addresses) {
    accountLoader.clear(address);
  }
  // Refetch the queries
  await Promise.all(
    addresses.map(async (address) => {
      await queryClient.refetchQueries({
        queryKey: createAccountQueryKey(address),
        exact: true,
      });
    }),
  );
};
