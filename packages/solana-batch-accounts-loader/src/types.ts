import type {
  Account,
  Address,
  GetMultipleAccountsApi,
  ReadonlyUint8Array,
  Rpc,
} from "@solana/kit";

export type RawAccount = Account<ReadonlyUint8Array>;

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
