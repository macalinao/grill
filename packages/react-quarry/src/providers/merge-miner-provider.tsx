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
  loading?: React.ReactNode;
}

/**
 * Provides info about the merge pool and the user's merge miner.
 *
 * @param param0
 * @returns
 */
export const MergeMinerProvider: React.FC<Props> = ({
  children,
  loading,
}: Props) => {
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
  if (
    !(mergePoolAddress && mergePoolAccount) ||
    mergeMinerAddress === undefined
  ) {
    return loading ?? <div>Loading...</div>;
  }

  // Get balance from merge miner account, default to 0
  const balanceRaw = mergeMinerAccount
    ? mergeMinerAccount.data.primaryBalance
    : mergeMinerAccount;

  return (
    <MergeMinerContext.Provider
      value={{
        mergePoolAddress,
        mergeMinerAddress,
        userAddress: signer?.address ?? null,
        balanceRaw,

        mergePool: mergePoolAccount,
        mergeMiner: mergeMinerAccount,
      }}
    >
      {children}
    </MergeMinerContext.Provider>
  );
};
