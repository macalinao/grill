import type { Rewarder } from "@macalinao/clients-quarry";
import type { AccountInfo } from "@macalinao/gill-extra";
import type { Instruction, TransactionSigner } from "@solana/kit";
import type { PoolInfo } from "../../../types.js";
import type { MergePoolAccount } from "../types.js";
import { isPoolRewardsInfoWithIouMint } from "../../../types.js";
import { createRedeemAllIxs } from "../../create-redeem-all-ixs.js";
import { claimPrimaryRewards } from "./claim-primary-rewards.js";
import { claimReplicaRewards } from "./claim-replica-rewards.js";

/**
 * Claims and redeems all rewards (primary and secondary) for a merge miner.
 * This handles both claiming rewards and redeeming IOU tokens if applicable.
 */
export async function claimAndRedeemAllRewardsMM({
  poolInfo,
  mergePool,
  signer,
  primaryRewarder,
  secondaryRewarders,
}: {
  poolInfo: PoolInfo;
  mergePool: MergePoolAccount;
  signer: TransactionSigner;
  primaryRewarder: AccountInfo<
    Pick<Rewarder, "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount">
  >;
  secondaryRewarders?: (
    | AccountInfo<
        Pick<
          Rewarder,
          "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
        >
      >
    | undefined
  )[];
}): Promise<Instruction[]> {
  // Claim primary rewards
  const primaryIxs = await claimPrimaryRewards({
    mergePool,
    mmOwner: signer,
    rewarder: primaryRewarder,
  });

  // Prepare primary redemption instructions
  const primaryRedemptionIxs: Instruction[] = [];
  if (isPoolRewardsInfoWithIouMint(poolInfo.primaryRewards)) {
    primaryRedemptionIxs.push(
      ...(await createRedeemAllIxs({
        rewardsInfo: poolInfo.primaryRewards,
        withdrawer: signer,
      })),
    );
  }

  // Prepare secondary/replica rewards instructions
  const secondaryIxs: Instruction[] = [];
  if (poolInfo.secondaryRewards?.length && secondaryRewarders?.length) {
    for (let i = 0; i < poolInfo.secondaryRewards.length; i++) {
      const secondaryReward = poolInfo.secondaryRewards[i];
      const rewarderData = secondaryRewarders[i];

      if (!(secondaryReward && rewarderData)) {
        if (secondaryReward) {
          console.error(
            `Rewarder data for ${secondaryReward.rewarder} not found`,
          );
        }
        continue;
      }

      try {
        const replicaIxs = await claimReplicaRewards({
          mergePool,
          mmOwner: signer,
          rewarder: rewarderData,
        });
        secondaryIxs.push(...replicaIxs);

        if (isPoolRewardsInfoWithIouMint(secondaryReward)) {
          secondaryIxs.push(
            ...(await createRedeemAllIxs({
              rewardsInfo: secondaryReward,
              withdrawer: signer,
            })),
          );
        }
      } catch (error) {
        console.error(
          `Failed to generate claim instructions for ${secondaryReward.rewardsToken.symbol} rewards:`,
          error,
        );
      }
    }
  }

  return [...primaryIxs, ...primaryRedemptionIxs, ...secondaryIxs];
}
