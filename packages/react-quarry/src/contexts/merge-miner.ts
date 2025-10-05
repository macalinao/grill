import type { MergeMiner, MergePool } from "@macalinao/quarry";
import type { Account, Address } from "@solana/kit";
import { createContext, useContext } from "react";

export interface MergeMinerContextValue {
  mergePoolAddress: Address;
  mergeMinerAddress: Address | null;
  userAddress: Address | null;
  /**
   * Null = doesn't exist (balance is effectively)
   * Undefined = loading
   */
  balanceRaw: bigint | null | undefined;

  /**
   * The merge pool.
   */
  mergePool: Account<MergePool>;
  /**
   * The user's merge miner.
   *
   * Null if it doesn't exist, undefined if loading.
   */
  mergeMiner: Account<MergeMiner> | null | undefined;
}

export const MergeMinerContext: React.Context<MergeMinerContextValue | null> =
  createContext<MergeMinerContextValue | null>(null);

export const useMergeMinerContext: () => MergeMinerContextValue = () => {
  const context = useContext(MergeMinerContext);
  if (!context) {
    throw new Error("MergeMinerContext not found");
  }
  return context;
};
