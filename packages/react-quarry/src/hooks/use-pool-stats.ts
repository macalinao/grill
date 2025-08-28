import type { PoolInfo, TokenAmount } from "@macalinao/quarry";
import { createTokenAmount } from "@macalinao/quarry";
import { useMemo } from "react";
import { useQuarry } from "../accounts/quarry.js";
import { useQuarryPda } from "../pdas/quarry.js";

export interface PoolStats {
  annualRewardsRate: TokenAmount | null;
  totalDeposits: TokenAmount | null;
  isLoading: boolean;
}

export const usePoolStats = (poolInfo: PoolInfo): PoolStats => {
  // Get the quarry PDA for the primary rewards
  const quarryAddress = useQuarryPda({
    rewarder: poolInfo.primaryRewards.rewarder,
    tokenMint: poolInfo.stakedToken.mint,
  });

  // Fetch the quarry account data
  const { data: quarryAccount, isLoading } = useQuarry({
    address: quarryAddress,
  });

  // Calculate token amounts
  const stats = useMemo(() => {
    if (!quarryAccount?.data) {
      return {
        annualRewardsRate: null,
        totalDeposits: null,
      };
    }

    // Create TokenAmount for annual rewards rate (rewards token)
    const annualRewardsRate = createTokenAmount(
      poolInfo.primaryRewards.rewardsToken,
      quarryAccount.data.annualRewardsRate,
    );

    // Create TokenAmount for total deposits (staked token)
    const totalDeposits = createTokenAmount(
      poolInfo.stakedToken,
      quarryAccount.data.totalTokensDeposited,
    );

    return {
      annualRewardsRate,
      totalDeposits,
    };
  }, [
    quarryAccount?.data,
    poolInfo.primaryRewards.rewardsToken,
    poolInfo.stakedToken,
  ]);

  return {
    annualRewardsRate: stats.annualRewardsRate,
    totalDeposits: stats.totalDeposits,
    isLoading,
  };
};
