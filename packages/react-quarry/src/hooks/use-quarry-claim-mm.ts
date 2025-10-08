import type { Signature } from "@solana/kit";
import { useKitWallet, useSendTX } from "@macalinao/grill";
import {
  claimAndRedeemAllRewardsMM,
  claimPrimaryRewards,
} from "@macalinao/quarry";
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
  const { mergePool } = useMergeMinerContext();
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
      mergePool,
      mmOwner: signer,
      rewarder: primaryRewarder,
    });

    return sendTX(
      `Claim ${poolInfo.primaryRewards.rewardsToken.symbol} Rewards`,
      ixs,
    );
  }, [
    signer,
    primaryRewarder,
    mergePool,
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

    const allInstructions = await claimAndRedeemAllRewardsMM({
      poolInfo,
      mergePool,
      signer,
      primaryRewarder,
      secondaryRewarders: secondaryRewardersResult.data.map((d) =>
        d === null ? undefined : d,
      ),
    });

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
    poolInfo,
    secondaryRewardersResult.data,
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
