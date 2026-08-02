import type { Address, EncodedAccount } from "@solana/kit";
import type {
  BatchAccountsLoader,
  BatchAccountsLoaderConfig,
  RawAccount,
} from "./types.js";
import { DataLoader } from "@macalinao/dataloader-es";
import { address, fetchEncodedAccounts } from "@solana/kit";
import { chunk } from "lodash-es";

/**
 * Creates a DataLoader for batching Solana RPC account fetches.
 *
 * @param config - The configuration for the DataLoader.
 * @returns A DataLoader for batching Solana RPC account fetches.
 */
export function createBatchAccountsLoader({
  rpc,
  commitment = "confirmed",
  maxBatchSize = 99,
  batchDurationMs = 10,
  cache = false,
  onFetchAccounts,
}: BatchAccountsLoaderConfig): BatchAccountsLoader {
  return new DataLoader<Address, EncodedAccount | null>(
    async (keys) => {
      // Caching is off by default, which makes this loader a pure request
      // coalescer — so the same address can legitimately appear more than once
      // in a batch. Dedupe before hitting the RPC so duplicates don't burn
      // slots against the 99-account limit, then fan results back out to every
      // original key below.
      const uniqueKeys = [...new Set(keys)];

      // Process in chunks to respect RPC limits
      const chunks = chunk(
        uniqueKeys,
        // maximum number of accounts that can be fetched in a single RPC call from a Solana RPC node
        99,
      );

      const entries = (
        await Promise.all(
          chunks.map(
            async (
              addressChunk,
            ): Promise<[Address, RawAccount | null | Error][]> => {
              try {
                const addresses = addressChunk.map((key) => address(key));
                const accounts = await fetchEncodedAccounts(rpc, addresses, {
                  commitment,
                });

                // Call onFetchAccounts callback if provided
                if (onFetchAccounts) {
                  onFetchAccounts(addressChunk);
                }

                return addressChunk.map((key, i) => {
                  const account = accounts[i];
                  if (!account?.exists) {
                    return [key, null];
                  }
                  return [
                    key,
                    {
                      address: account.address,
                      data: account.data,
                      executable: account.executable,
                      lamports: account.lamports,
                      programAddress: account.programAddress,
                      space: account.space,
                    },
                  ];
                });
              } catch (error) {
                // If the batch fails, fail every key in this chunk. DataLoader
                // requires exactly one result per key, so we must return an
                // Error per key rather than a single Error for the whole chunk.
                const chunkError = new Error(
                  `Failed to fetch accounts: ${error instanceof Error ? error.message : String(error)}`,
                );
                return addressChunk.map((key) => [key, chunkError]);
              }
            },
          ),
        )
      ).flat();

      const resultsByAddress = new Map(entries);
      return keys.map((key) => resultsByAddress.get(key) ?? null);
    },
    {
      batchScheduleFn: (callback) => {
        setTimeout(callback, batchDurationMs);
      },
      maxBatchSize,
      cache,
    },
  );
}
