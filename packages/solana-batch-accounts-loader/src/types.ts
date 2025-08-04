import type {
  AccountInfoBase,
  GetMultipleAccountsApi,
  ReadonlyUint8Array,
  Rpc,
} from "@solana/kit";

export interface AccountInfo extends AccountInfoBase {
  readonly data: ReadonlyUint8Array;
}

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
}
