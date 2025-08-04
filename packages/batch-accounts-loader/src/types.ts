import type {
  Address,
  GetMultipleAccountsApi,
  ReadonlyUint8Array,
  Rpc,
} from "@solana/kit";

export interface AccountInfo {
  readonly data: ReadonlyUint8Array;
  readonly executable: boolean;
  readonly lamports: bigint;
  readonly owner: Address;
  readonly rentEpoch?: bigint;
}

export interface BatchAccountsLoaderConfig {
  rpc: Rpc<GetMultipleAccountsApi>;
  commitment?: "confirmed" | "finalized";
  maxBatchSize?: number;
}
