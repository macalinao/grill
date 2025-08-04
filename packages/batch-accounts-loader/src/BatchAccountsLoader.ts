import type { Address } from "@solana/kit";
import { address } from "@solana/kit";
import { DataLoader } from "@macalinao/dataloader-es";
import { chunk } from "lodash-es";

import type { AccountInfo, BatchAccountsLoaderConfig } from "./types.js";

export class BatchAccountsLoader {
  private dataLoader: DataLoader<string, AccountInfo | null>;

  constructor(private config: BatchAccountsLoaderConfig) {
    const maxBatchSize = config.maxBatchSize ?? 100;

    this.dataLoader = new DataLoader<string, AccountInfo | null>(
      async (keys) => {
        const results: (AccountInfo | null)[] = [];

        // Process in chunks to respect RPC limits
        const chunks = chunk(keys as string[], maxBatchSize);

        for (const addressChunk of chunks) {
          try {
            const addresses = addressChunk.map((key) => address(key));
            const response = await this.config.rpc
              .getMultipleAccounts(addresses, {
                commitment: this.config.commitment ?? "confirmed",
                encoding: "base64",
              })
              .send();

            const chunkResults = response.value.map((account: any) => {
              if (!account) return null;

              return {
                data: account.data[0],
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
              `Failed to fetch accounts: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        return results;
      },
      {
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize,
      }
    );
  }

  /**
   * Load a single account by its address
   */
  async load(accountId: Address): Promise<AccountInfo | null> {
    return this.dataLoader.load(accountId);
  }

  /**
   * Load multiple accounts by their addresses
   */
  async loadMany(
    accountIds: Address[]
  ): Promise<(AccountInfo | null | Error)[]> {
    return this.dataLoader.loadMany(accountIds.map(String));
  }

  /**
   * Clear all cached accounts
   */
  clearAll(): void {
    this.dataLoader.clearAll();
  }

  /**
   * Clear a specific account from the cache
   */
  clear(accountId: Address): void {
    this.dataLoader.clear(accountId);
  }

  /**
   * Prime the cache with a specific value
   */
  prime(accountId: Address, value: AccountInfo | null): void {
    this.dataLoader.prime(accountId, value);
  }
}
