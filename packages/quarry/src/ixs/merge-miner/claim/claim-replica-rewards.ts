import type { Rewarder } from "@macalinao/clients-quarry";
import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "../types.js";
import type { QuarryStakeAccounts } from "./types.js";
import {
  findMergeMinerPda,
  findMinerPda,
  findQuarryPda,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { claimMMRewards } from "./claim-mm-rewards.js";

/**
 * Creates instructions to claim rewards for a replica miner
 */
export async function claimReplicaRewards({
  mergePool,
  mmOwner,
  rewarder,
}: {
  mergePool: MergePoolAccount;
  mmOwner: TransactionSigner;
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
    owner: mmOwner.address,
  });

  return claimMMRewards({
    quarryMint: mergePool.data.replicaMint,
    stake,
    mmOwner,
    rewarder,
  });
}

/**
 * Get the stake accounts for a replica miner
 */
export async function getReplicaStakeAccounts({
  rewarder,
  mergePool,
  owner,
}: {
  rewarder: Address;
  mergePool: MergePoolAccount;
  owner: Address;
}): Promise<QuarryStakeAccounts> {
  // Derive the merge miner from pool and owner
  const [mm] = await findMergeMinerPda({
    pool: mergePool.address,
    owner,
  });

  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: mergePool.data.replicaMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: mergePool.data.replicaMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return {
    pool: mergePool.address,
    mm,
    rewarder,
    quarry,
    miner,
    minerVault,
  };
}
