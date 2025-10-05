import type { Signature } from "@solana/kit";
import { useKitWallet, useSendTX } from "@macalinao/grill";
import { createDepositMergeMinerIxs } from "@macalinao/quarry";
import { useCallback } from "react";
import { useMergeMinerContext } from "../contexts/merge-miner.js";
import { usePoolInfo } from "../contexts/pool-info.js";

export interface QuarryDepositMMArgs {
  amount: bigint;
}

export interface UseQuarryDepositMMResult {
  deposit: (args: QuarryDepositMMArgs) => Promise<Signature>;
  isReady: boolean;
}

export const useQuarryDepositMM = (): UseQuarryDepositMMResult => {
  const { mergePool, mergeMiner } = useMergeMinerContext();
  const { poolInfo } = usePoolInfo();
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  const deposit = useCallback(
    async ({ amount }: QuarryDepositMMArgs): Promise<Signature> => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }

      const { ixs } = await createDepositMergeMinerIxs({
        amount,
        rewarder: poolInfo.primaryRewards.rewarder,
        mergePool,
        payer: signer,
        replicaRewarders:
          poolInfo.secondaryRewards?.map((r) => r.rewarder) ?? [],
        mmOwner: signer,
        initMergeMiner: !mergeMiner,
      });

      return sendTX("Deposit to Merge Miner", ixs);
    },
    [
      signer,
      poolInfo.primaryRewards.rewarder,
      poolInfo.secondaryRewards,
      mergePool,
      mergeMiner,
      sendTX,
    ],
  );

  const isReady = !!signer && !!mergePool;

  return {
    deposit,
    isReady,
  };
};
