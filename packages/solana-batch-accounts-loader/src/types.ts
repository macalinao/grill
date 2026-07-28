import type { DataLoader } from "@macalinao/dataloader-es";
import type { Address, EncodedAccount } from "@solana/kit";

export type RawAccount = EncodedAccount;

/**
 * RPC type that has the getMultipleAccounts method.
 * This is a permissive type that accepts any Rpc with getMultipleAccounts.
 */
export type RpcWithGetMultipleAccounts = Parameters<
  typeof import("@solana/kit").fetchEncodedAccounts
>[0];

export interface BatchAccountsLoaderConfig {
  rpc: RpcWithGetMultipleAccounts;
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
   * Whether the loader should memoize results per address for its lifetime.
   *
   * Defaults to `false`, which makes the loader a pure request coalescer:
   * concurrent loads are still batched into a single RPC call, but nothing is
   * retained afterwards. This leaves the caching layer (e.g. React Query) as
   * the single source of truth, so invalidating a query actually refetches from
   * the RPC.
   *
   * Setting this to `true` restores DataLoader's default memoization, in which
   * an address is fetched at most once for the lifetime of the loader and
   * subsequent loads replay the cached value until `clear()` is called. Only do
   * this if the loader is short-lived (e.g. scoped to a single request).
   */
  cache?: boolean;
  /**
   * Called when accounts are fetched with the addresses that were fetched.
   */
  onFetchAccounts?: (addresses: Address[]) => void;
}

/**
 * A DataLoader for batching Solana RPC account fetches.
 */
export type BatchAccountsLoader = DataLoader<Address, RawAccount | null>;
