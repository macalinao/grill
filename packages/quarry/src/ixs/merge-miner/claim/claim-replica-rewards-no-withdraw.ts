import type { Rewarder } from "@macalinao/clients-quarry";
import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "../types.js";
import { claimMMRewardsNoWithdraw } from "./claim-mm-rewards-no-withdraw.js";
import { getReplicaStakeAccounts } from "./claim-replica-rewards.js";

/**
 * Creates instructions to claim rewards for a replica miner without withdrawing.
 * This is a permissionless function for cases where the claimer does not have authority over the merge miner.
 */
export async function claimReplicaRewardsNoWithdraw({
  mergePool,
  mmOwner,
  payer,
  rewarder,
}: {
  mergePool: MergePoolAccount;
  mmOwner: Address;
  payer: TransactionSigner;
  rewarder: {
    address: Address;
    data: Pick<
      Rewarder,
      "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
    >;
  };
}): Promise<Instruction[]> {
  const stake = await getReplicaStakeAccounts({
    rewarder: rewarder.address,
    mergePool,
    owner: mmOwner,
  });

  return claimMMRewardsNoWithdraw({
    quarryMint: mergePool.data.replicaMint,
    stake,
    payer,
    rewarder,
  });
}
