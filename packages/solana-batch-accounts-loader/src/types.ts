import type { DataLoader } from "@macalinao/dataloader-es";
import type {
  Address,
  EncodedAccount,
  GetMultipleAccountsApi,
  Rpc,
} from "@solana/kit";

export type RawAccount = EncodedAccount;

export interface BatchAccountsLoaderConfig {
  rpc: Rpc<GetMultipleAccountsApi>;
  commitment?: "confirmed" | "finalized";
  maxBatchSize?: number;
  /**
   * The duration in milliseconds to wait before executing the batch.
   *
   * Lower values will batch more frequently, but may increase the number of RPC calls.
   *
   * Defaults to 10ms.
   */
  batchDurationMs?: number;
  /**
   * Called when accounts are fetched with the addresses that were fetched.
   */
  onFetchAccounts?: (addresses: Address[]) => void;
}

/**
 * A DataLoader for batching Solana RPC account fetches.
 */
export type BatchAccountsLoader = DataLoader<Address, RawAccount | null>;
