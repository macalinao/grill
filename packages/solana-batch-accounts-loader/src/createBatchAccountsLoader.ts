import { DataLoader } from "@macalinao/dataloader-es";
import type { Address } from "@solana/kit";
import { address, fetchEncodedAccounts } from "@solana/kit";
import { chunk } from "lodash-es";

import type { BatchAccountsLoaderConfig, RawAccount } from "./types.js";

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
  onFetchAccounts,
}: BatchAccountsLoaderConfig): DataLoader<Address, RawAccount | null> {
  return new DataLoader<Address, RawAccount | null>(
    async (keys) => {
      // Process in chunks to respect RPC limits
      const chunks = chunk(
        keys,
        // maximum number of accounts that can be fetched in a single RPC call from a Solana RPC node
        99,
      );

      return (
        await Promise.all(
          chunks.map(async (addressChunk) => {
            try {
              const addresses = addressChunk.map((key) => address(key));
              const accounts = await fetchEncodedAccounts(rpc, addresses, {
                commitment,
              });

              // Call onFetchAccounts callback if provided
              if (onFetchAccounts) {
                onFetchAccounts(addressChunk);
              }

              return accounts.map((account): RawAccount | null => {
                if (!account.exists) {
                  return null;
                }
                return {
                  address: account.address,
                  data: account.data,
                  executable: account.executable,
                  lamports: account.lamports,
                  programAddress: account.programAddress,
                  space: account.space,
                };
              });
            } catch (error) {
              // If batch fails, throw error for all keys in this chunk
              return new Error(
                `Failed to fetch accounts: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }),
        )
      ).flat();
    },
    {
      batchScheduleFn: (callback) => setTimeout(callback, batchDurationMs),
      maxBatchSize,
    },
  );
}
