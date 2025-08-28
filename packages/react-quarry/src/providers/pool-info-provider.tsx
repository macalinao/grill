import type { PoolInfo, PoolQuarryInfo } from "@macalinao/quarry";
import type * as React from "react";
import { PoolInfoContext } from "../contexts/pool-info.js";

interface Props {
  poolInfo: PoolInfo;
  children?: React.ReactNode;
}

export const PoolInfoProvider: React.FC<Props> = ({
  poolInfo,
  children,
}: Props) => {
  const primaryPoolInfo = {
    ...poolInfo.primaryRewards,
    stakedToken: poolInfo.stakedToken,
    isReplica: false,
  };
  const allPools: PoolQuarryInfo[] = [
    primaryPoolInfo,
    ...(poolInfo.secondaryRewards?.map((rew) => ({
      ...rew,
      stakedToken: poolInfo.stakedToken,
      isReplica: true,
    })) ?? []),
  ];
  return (
    <PoolInfoContext.Provider
      value={{
        poolInfo,
        primaryPoolInfo,
        allPools,
      }}
    >
      {children}
    </PoolInfoContext.Provider>
  );
};
