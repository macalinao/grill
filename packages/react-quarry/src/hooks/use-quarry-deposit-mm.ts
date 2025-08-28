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
  const { mergePool, mergePoolAddress } = useMergeMinerContext();
  const { poolInfo } = usePoolInfo();
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  const deposit = useCallback(
    async ({ amount }: QuarryDepositMMArgs): Promise<Signature> => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }

      if (!poolInfo.primaryRewards.rewarder) {
        throw new Error("No primary rewarder found");
      }

      const { ixs } = await createDepositMergeMinerIxs({
        amount,
        rewarder: poolInfo.primaryRewards.rewarder,
        mergePool: {
          address: mergePoolAddress,
          data: mergePool,
        },
        payer: signer,
        replicaRewarders:
          poolInfo.secondaryRewards?.map((r) => r.rewarder) ?? [],
        mmOwner: signer,
      });

      return sendTX("Deposit to Merge Miner", ixs);
    },
    [
      signer,
      poolInfo.primaryRewards.rewarder,
      poolInfo.secondaryRewards,
      mergePoolAddress,
      mergePool,
      sendTX,
    ],
  );

  const isReady = !!signer && !!mergePool;

  return {
    deposit,
    isReady,
  };
};
