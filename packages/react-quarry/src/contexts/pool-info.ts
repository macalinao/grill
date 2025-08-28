import type { PoolInfo, PoolQuarryInfo } from "@macalinao/quarry";
import { createContext, useContext } from "react";

export interface PoolInfoContextValue {
  poolInfo: PoolInfo;
  primaryPoolInfo: PoolQuarryInfo;
  allPools: PoolQuarryInfo[];
}

export const PoolInfoContext: React.Context<PoolInfoContextValue | null> =
  createContext<PoolInfoContextValue | null>(null);

export const usePoolInfo: () => PoolInfoContextValue = () => {
  const context = useContext(PoolInfoContext);
  if (!context) {
    throw new Error("PoolInfoContext not found");
  }
  return context;
};
