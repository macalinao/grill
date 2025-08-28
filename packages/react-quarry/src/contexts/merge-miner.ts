import type { MergePool } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createContext, useContext } from "react";

export interface MergeMinerContextValue {
  mergePool: MergePool;
  mergePoolAddress: Address;
  userAddress: Address | null;
  balance: bigint;
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
