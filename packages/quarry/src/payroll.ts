import type { Quarry } from "@macalinao/clients-quarry";
import { bigintMax, bigintMin } from "./bigint.js";

export const MAX_U64: bigint = 2n ** 64n - 1n;

export const SECONDS_PER_YEAR: bigint = 365n * 86_400n;

export type QuarryPayroll = Pick<
  Quarry,
  | "famineTs"
  | "lastUpdateTs"
  | "annualRewardsRate"
  | "rewardsPerTokenStored"
  | "totalTokensDeposited"
>;

/**
 * Calculates the amount of tokens that this user can receive.
 * @returns Rewards per token
 */
export function calculateRewardPerToken({
  quarry,
  currentTs,
}: {
  quarry: QuarryPayroll;
  currentTs: bigint;
}): bigint {
  if (quarry.totalTokensDeposited === 0n) {
    return quarry.rewardsPerTokenStored;
  }

  const lastTimeRewardsApplicable = bigintMin(currentTs, quarry.famineTs);
  const timeWorked = bigintMax(
    0n,
    lastTimeRewardsApplicable - quarry.lastUpdateTs,
  );
  const reward =
    (timeWorked * MAX_U64 * quarry.annualRewardsRate) /
    SECONDS_PER_YEAR /
    quarry.totalTokensDeposited;
  return quarry.rewardsPerTokenStored + reward;
}

/**
 * Calculates the amount of tokens that this user can claim.
 * @returns Total rewards earned
 */
export function calculateRewardsEarned({
  quarry,
  currentTs,
  tokensDeposited,
  rewardsPerTokenPaid,
  rewardsEarned,
}: {
  quarry: QuarryPayroll;
  currentTs: bigint;
  tokensDeposited: bigint;
  rewardsPerTokenPaid: bigint;
  rewardsEarned: bigint;
}): bigint {
  const netNewRewards =
    calculateRewardPerToken({ quarry, currentTs }) - rewardsPerTokenPaid;
  const earnedRewards = (tokensDeposited * netNewRewards) / MAX_U64;
  return earnedRewards + rewardsEarned;
}
