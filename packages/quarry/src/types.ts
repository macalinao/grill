import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";

export interface PoolRewardsInfo {
  rewarder: Address;
  rewardsToken: TokenInfo;
  iouMint?: Address;
}

export const isPoolRewardsInfoWithIouMint = (
  rewardsInfo: PoolRewardsInfo,
): rewardsInfo is PoolRewardsInfoWithIouMint => {
  return rewardsInfo.iouMint !== undefined;
};

export type PoolRewardsInfoWithIouMint = PoolRewardsInfo & {
  iouMint: Address;
};

export type PoolQuarryInfo = PoolRewardsInfo & {
  isReplica?: boolean;
  stakedToken: TokenInfo;
};

export type PoolInfo = Readonly<{
  stakedToken: TokenInfo;
  primaryRewards: PoolRewardsInfo;
  secondaryRewards?: readonly PoolRewardsInfo[];
}>;
