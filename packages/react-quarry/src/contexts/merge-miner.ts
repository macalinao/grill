import type { MergePool } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createContext, useContext } from "react";

export interface MergeMinerContextValue {
  mergePool: MergePool;
  mergePoolAddress: Address;
  mergeMinerAddress: Address | null;
  userAddress: Address | null;
  /**
   * Null = doesn't exist (balance is effectively)
   * Undefined = loading
   */
  balanceRaw: bigint | null | undefined;
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
