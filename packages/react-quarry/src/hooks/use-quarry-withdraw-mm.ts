import type { Address, Signature } from "@solana/kit";
import { useKitWallet, useSendTX } from "@macalinao/grill";
import { createWithdrawMergeMinerIxs } from "@macalinao/quarry";
import { useCallback } from "react";
import { useMergeMinerContext } from "../contexts/merge-miner.js";
import { usePoolInfo } from "../contexts/pool-info.js";

export interface QuarryWithdrawMMArgs {
  amount: bigint;
  tokenDestination?: Address;
}

export interface UseQuarryWithdrawMMResult {
  withdraw: (args: QuarryWithdrawMMArgs) => Promise<Signature>;
  isReady: boolean;
}

export const useQuarryWithdrawMM = (): UseQuarryWithdrawMMResult => {
  const { mergePool } = useMergeMinerContext();
  const { poolInfo } = usePoolInfo();
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  const withdraw = useCallback(
    async ({
      amount,
      tokenDestination,
    }: QuarryWithdrawMMArgs): Promise<Signature> => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }

      const ixs = await createWithdrawMergeMinerIxs({
        amount,
        tokenDestination,
        rewarder: poolInfo.primaryRewards.rewarder,
        mergePool,
        owner: signer,
        payer: signer,
        replicaRewarders:
          poolInfo.secondaryRewards?.map((r) => r.rewarder) ?? [],
      });

      return sendTX("Withdraw from Merge Miner", ixs);
    },
    [
      signer,
      poolInfo.primaryRewards.rewarder,
      poolInfo.secondaryRewards,
      mergePool,
      sendTX,
    ],
  );

  const isReady = !!signer && !!mergePool;

  return {
    withdraw,
    isReady,
  };
};
