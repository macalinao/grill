import type { Address, GetMultipleAccountsApi, Rpc } from "@solana/kit";
import { address } from "@solana/kit";
import DataLoader from "dataloader";
import { chunk, zip } from "lodash-es";

import { KiteGetMultipleAccountsError } from "../errors";

export interface AccountInfo {
  readonly data: string;
  readonly executable: boolean;
  readonly lamports: bigint;
  readonly owner: Address;
  readonly rentEpoch?: bigint;
}

export interface BatchProviderConfig {
  rpc: Rpc<GetMultipleAccountsApi>;
  commitment?: "confirmed" | "finalized";
  maxBatchSize?: number;
}

export class KiteBatchProvider {
  private dataLoader: DataLoader<string, AccountInfo | null>;

  constructor(private config: BatchProviderConfig) {
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

            const chunkResults = response.value.map((account) => {
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
            throw new KiteGetMultipleAccountsError(error);
          }
        }

        return results;
      },
      {
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize,
      },
    );
  }

  async load(accountId: Address): Promise<AccountInfo | null> {
    return this.dataLoader.load(accountId);
  }

  async loadMany(accountIds: Address[]): Promise<(AccountInfo | null)[]> {
    return this.dataLoader.loadMany(accountIds.map(String));
  }

  clearAll(): void {
    this.dataLoader.clearAll();
  }

  clear(accountId: Address): void {
    this.dataLoader.clear(accountId);
  }
}