import { DataLoader } from "@macalinao/dataloader-es";
import { address, getBase64Encoder } from "@solana/kit";
import { chunk } from "lodash-es";

import type { AccountInfo, BatchAccountsLoaderConfig } from "./types.js";

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
}: BatchAccountsLoaderConfig): DataLoader<string, AccountInfo | null> {
  return new DataLoader<string, AccountInfo | null>(
    async (keys) => {
      const encoder = getBase64Encoder();
      // Process in chunks to respect RPC limits
      const chunks = chunk(
        keys as string[],
        // maximum number of accounts that can be fetched in a single RPC call from a Solana RPC node
        99,
      );

      return (
        await Promise.all(
          chunks.map(async (addressChunk) => {
            try {
              const addresses = addressChunk.map((key) => address(key));
              const response = await rpc
                .getMultipleAccounts(addresses, {
                  commitment,
                  encoding: "base64",
                })
                .send();

              return response.value.map((account): AccountInfo | null => {
                if (!account) {
                  return null;
                }
                return {
                  data: encoder.encode(account.data[0]),
                  executable: account.executable,
                  lamports: account.lamports,
                  owner: account.owner,
                  rentEpoch: account.rentEpoch,
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
