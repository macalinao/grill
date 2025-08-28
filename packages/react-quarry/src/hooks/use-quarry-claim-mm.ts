import type { Signature } from "@solana/kit";
import { useKitWallet, useSendTX } from "@macalinao/grill";
import {
  claimPrimaryRewards,
  claimReplicaRewards,
  getRewarderDecoder,
} from "@macalinao/quarry";
import { address } from "@solana/kit";
import { useSolanaClient } from "gill-react";
import { useCallback } from "react";
import { useRewarder } from "../accounts/rewarder.js";
import { useMergeMinerContext } from "../contexts/merge-miner.js";
import { usePoolInfo } from "../contexts/pool-info.js";

export interface UseQuarryClaimMMResult {
  claimAll: () => Promise<Signature[]>;
  claimPrimary: () => Promise<Signature>;
  isReady: boolean;
}

export const useQuarryClaimMM = (): UseQuarryClaimMMResult => {
  const { mergePool, mergePoolAddress } = useMergeMinerContext();
  const { poolInfo } = usePoolInfo();
  const { signer } = useKitWallet();
  const { rpc } = useSolanaClient();
  const sendTX = useSendTX();

  // Fetch primary rewarder data
  const { data: primaryRewarder } = useRewarder({
    address: poolInfo.primaryRewards.rewarder,
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

  const claimAll = useCallback(async (): Promise<Signature[]> => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    if (!primaryRewarder) {
      throw new Error("Primary rewarder data not loaded");
    }

    const signatures: Signature[] = [];

    // Claim primary rewards first
    try {
      const primarySig = await claimPrimary();
      signatures.push(primarySig);
    } catch (error) {
      console.error("Failed to claim primary rewards:", error);
    }

    // Claim all secondary/replica rewards
    if (poolInfo.secondaryRewards && poolInfo.secondaryRewards.length > 0) {
      for (const secondaryReward of poolInfo.secondaryRewards) {
        try {
          // Use the useAccount hook to fetch rewarder data
          const rewarderAccount = await rpc
            .getAccountInfo(address(secondaryReward.rewarder), {
              encoding: "base64",
              commitment: "confirmed",
            })
            .send();

          if (!rewarderAccount.value) {
            console.error(
              `Rewarder account ${secondaryReward.rewarder} not found`,
            );
            continue;
          }

          // Decode the rewarder account
          const decoder = getRewarderDecoder();
          const rewarderData = decoder.decode(
            new Uint8Array(
              Buffer.from(rewarderAccount.value.data[0], "base64"),
            ),
          );

          const ixs = await claimReplicaRewards({
            mergePool: {
              address: mergePoolAddress,
              data: mergePool,
            },
            mmOwner: signer,
            rewarder: {
              address: address(secondaryReward.rewarder),
              data: rewarderData,
            },
          });

          const sig = await sendTX(
            `Claim ${secondaryReward.rewardsToken.symbol} Rewards`,
            ixs,
          );
          signatures.push(sig);
        } catch (error) {
          console.error(
            `Failed to claim ${secondaryReward.rewardsToken.symbol} rewards:`,
            error,
          );
        }
      }
    }

    return signatures;
  }, [
    signer,
    primaryRewarder,
    claimPrimary,
    poolInfo.secondaryRewards,
    rpc,
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
