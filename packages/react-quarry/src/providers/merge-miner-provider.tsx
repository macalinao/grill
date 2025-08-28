import type * as React from "react";
import { useKitWallet } from "@macalinao/grill";
import { useMergeMiner } from "../accounts/merge-miner.js";
import { useMergePool } from "../accounts/merge-pool.js";
import { MergeMinerContext } from "../contexts/merge-miner.js";
import { usePoolInfo } from "../contexts/pool-info.js";
import { useMergeMinerPda } from "../pdas/merge-miner.js";
import { useMergePoolPda } from "../pdas/merge-pool.js";

interface Props {
  children?: React.ReactNode;
}

export const MergeMinerProvider: React.FC<Props> = ({ children }: Props) => {
  const poolInfo = usePoolInfo();
  const { signer } = useKitWallet();
  const mergePoolAddress = useMergePoolPda({
    primaryMint: poolInfo.poolInfo.stakedToken.mint,
  });

  // Get merge miner PDA if user is connected
  const mergeMinerAddress = useMergeMinerPda(
    signer?.address && mergePoolAddress
      ? {
          pool: mergePoolAddress,
          owner: signer.address,
        }
      : null,
  );

  // Always call the hooks
  const { data: mergePoolAccount } = useMergePool({
    address: mergePoolAddress,
  });

  const { data: mergeMinerAccount } = useMergeMiner({
    address: mergeMinerAddress,
  });

  // TODO(igm): probably want to create a proper loading state here
  if (!(mergePoolAddress && mergePoolAccount)) {
    return <div>Loading...</div>;
  }

  // Get balance from merge miner account, default to 0
  const balance = mergeMinerAccount?.data.primaryBalance ?? 0n;

  return (
    <MergeMinerContext.Provider
      value={{
        mergePool: mergePoolAccount.data,
        mergePoolAddress,
        userAddress: signer?.address ?? null,
        balance,
      }}
    >
      {children}
    </MergeMinerContext.Provider>
  );
};
