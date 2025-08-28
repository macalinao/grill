import type { Signature } from "@solana/kit";
import { useKitWallet, useSendTX } from "@macalinao/grill";
import { claimPrimaryRewards, claimReplicaRewards } from "@macalinao/quarry";
import { address } from "@solana/kit";
import { useCallback, useMemo } from "react";
import { useRewarder, useRewarders } from "../accounts/rewarder.js";
import { useMergeMinerContext } from "../contexts/merge-miner.js";
import { usePoolInfo } from "../contexts/pool-info.js";

export interface UseQuarryClaimMMResult {
  claimAll: () => Promise<Signature>;
  claimPrimary: () => Promise<Signature>;
  isReady: boolean;
}

export const useQuarryClaimMM = (): UseQuarryClaimMMResult => {
  const { mergePool, mergePoolAddress } = useMergeMinerContext();
  const { poolInfo } = usePoolInfo();
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  // Fetch primary rewarder data
  const { data: primaryRewarder } = useRewarder({
    address: poolInfo.primaryRewards.rewarder,
  });

  // Prepare addresses for all secondary rewarders
  const secondaryRewarderAddresses = useMemo(() => {
    if (!poolInfo.secondaryRewards || poolInfo.secondaryRewards.length === 0) {
      return [];
    }
    return poolInfo.secondaryRewards.map((reward) => reward.rewarder);
  }, [poolInfo.secondaryRewards]);

  // Fetch all secondary rewarders data at once
  const secondaryRewardersResult = useRewarders({
    addresses: secondaryRewarderAddresses,
  });

  const claimPrimary = useCallback(async (): Promise<Signature> => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    if (!primaryRewarder) {
      throw new Error("Primary rewarder data not loaded");
    }

    const ixs = await claimPrimaryRewards({
      mergePool: {
        address: mergePoolAddress,
        data: mergePool,
      },
      mmOwner: signer,
      rewarder: {
        address: poolInfo.primaryRewards.rewarder,
        data: primaryRewarder.data,
      },
    });

    return sendTX(
      `Claim ${poolInfo.primaryRewards.rewardsToken.symbol} Rewards`,
      ixs,
    );
  }, [
    signer,
    primaryRewarder,
    mergePoolAddress,
    mergePool,
    poolInfo.primaryRewards.rewarder,
    poolInfo.primaryRewards.rewardsToken.symbol,
    sendTX,
  ]);

  const claimAll = useCallback(async (): Promise<Signature> => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    if (!primaryRewarder) {
      throw new Error("Primary rewarder data not loaded");
    }

    // Collect all instructions in a single array
    const allInstructions = [];

    // Add primary rewards instructions
    const primaryIxs = await claimPrimaryRewards({
      mergePool: {
        address: mergePoolAddress,
        data: mergePool,
      },
      mmOwner: signer,
      rewarder: {
        address: poolInfo.primaryRewards.rewarder,
        data: primaryRewarder.data,
      },
    });
    allInstructions.push(...primaryIxs);

    // Add secondary/replica rewards instructions
    if (poolInfo.secondaryRewards?.length) {
      for (let i = 0; i < poolInfo.secondaryRewards.length; i++) {
        const secondaryReward = poolInfo.secondaryRewards[i];
        const rewarderData = secondaryRewardersResult.data[i];

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
            mergePool: {
              address: mergePoolAddress,
              data: mergePool,
            },
            mmOwner: signer,
            rewarder: {
              address: address(secondaryReward.rewarder),
              data: rewarderData.data,
            },
          });
          allInstructions.push(...replicaIxs);
        } catch (error) {
          console.error(
            `Failed to generate claim instructions for ${secondaryReward.rewardsToken.symbol} rewards:`,
            error,
          );
        }
      }
    }

    // Send all instructions in a single transaction
    const tokenSymbols = [
      poolInfo.primaryRewards.rewardsToken.symbol,
      ...(poolInfo.secondaryRewards?.map((r) => r.rewardsToken.symbol) ?? []),
    ];

    return sendTX(
      `Claim All Rewards (${tokenSymbols.join(", ")})`,
      allInstructions,
    );
  }, [
    signer,
    primaryRewarder,
    poolInfo.primaryRewards,
    poolInfo.secondaryRewards,
    secondaryRewardersResult.data,
    mergePoolAddress,
    mergePool,
    sendTX,
  ]);

  const isReady = !!signer && !!mergePool;

  return {
    claimAll,
    claimPrimary,
    isReady,
  };
};
