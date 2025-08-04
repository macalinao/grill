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
  maxBatchSize = 100,
}: BatchAccountsLoaderConfig): DataLoader<string, AccountInfo | null> {
  const encoder = getBase64Encoder();
  return new DataLoader<string, AccountInfo | null>(
    async (keys) => {
      const results: (AccountInfo | null)[] = [];

      // Process in chunks to respect RPC limits
      const chunks = chunk(keys as string[], maxBatchSize);

      for (const addressChunk of chunks) {
        try {
          const addresses = addressChunk.map((key) => address(key));
          const response = await rpc
            .getMultipleAccounts(addresses, {
              commitment,
              encoding: "base64",
            })
            .send();

          const chunkResults = response.value.map((account) => {
            if (!account) {
              return null;
            }

            return {
              data: encoder.encode(account.data[0]),
              executable: account.executable,
              lamports: account.lamports,
              owner: address(account.owner),
              rentEpoch: account.rentEpoch,
            };
          });

          results.push(...chunkResults);
        } catch (error) {
          // If batch fails, throw error for all keys in this chunk
          throw new Error(
            `Failed to fetch accounts: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      return results;
    },
    {
      // This batches all account fetches requested by the frontend within a 10ms window.
      batchScheduleFn: (callback) => setTimeout(callback, 10),
      maxBatchSize,
    },
  );
}
