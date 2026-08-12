import type { Address, EncodedAccount } from "@solana/kit";
import type {
  BatchAccountsLoader,
  BatchAccountsLoaderConfig,
  RawAccount,
} from "./types.js";
import { DataLoader } from "@macalinao/dataloader-es";
import { address, fetchEncodedAccounts } from "@solana/kit";

/**
 * Splits `items` into consecutive slices of at most `size`.
 *
 * Inlined rather than pulled from lodash-es: this is the only lodash usage in
 * the package, and it accounted for roughly half of the package's bundled size.
 */
function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

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
}: BatchAccountsLoaderConfig): BatchAccountsLoader {
  return new DataLoader<Address, EncodedAccount | null>(
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
      batchScheduleFn: (callback) => {
        setTimeout(callback, batchDurationMs);
      },
      maxBatchSize,
    },
  );
}
