import type { Miner, Quarry } from "@macalinao/clients-quarry";
import type { TokenInfo } from "@macalinao/token-utils";
import { calculateRewardsEarned } from "./payroll.js";

const PRECISION_SECONDS = 100_000;

/**
 * Creates a function that calculates the claimable amount of rewards for a miner. Uses number arithmetic to make things super fast.
 */
export const makeCalculateClaimableAmount = ({
  rewardsToken,
  quarryData,
  minerData,
}: {
  rewardsToken: TokenInfo;
  quarryData: Quarry;
  minerData: Miner;
}): {
  rewardsPerSecond: number;
  get: () => number;
} => {
  const start = Date.now();
  const [startAmount, endAmount] = [0, PRECISION_SECONDS * 1_000].map(
    (offset) => {
      return calculateRewardsEarned({
        quarry: quarryData,
        currentTs: BigInt(Math.floor((start + offset) / 1_000)),
        tokensDeposited: minerData.balance,
        rewardsPerTokenPaid: minerData.rewardsPerTokenPaid,
        rewardsEarned: minerData.rewardsEarned,
      });
    },
  ) as [bigint, bigint];

  const divisor = 10 ** rewardsToken.decimals;
  const startAmountNumber = Number(startAmount) / divisor;
  const rewardsPerSecond =
    Number(endAmount - startAmount) / divisor / PRECISION_SECONDS;

  return {
    rewardsPerSecond,
    get: () =>
      startAmountNumber + rewardsPerSecond * ((Date.now() - start) / 1_000),
  };
};
