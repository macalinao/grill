import type { Rewarder } from "@macalinao/clients-quarry";
import type { AccountInfo } from "@macalinao/gill-extra";
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
 * Creates instructions to claim rewards for a primary miner
 */
export async function claimPrimaryRewards({
  mergePool,
  mmOwner,
  rewarder,
}: {
  mergePool: MergePoolAccount;
  mmOwner: TransactionSigner;
  rewarder: AccountInfo<
    Pick<Rewarder, "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount">
  >;
}): Promise<Instruction[]> {
  const stake = await getPrimaryStakeAccounts({
    rewarder: rewarder.address,
    mergePool,
    owner: mmOwner.address,
  });

  return claimMMRewards({
    quarryMint: mergePool.data.primaryMint,
    stake,
    mmOwner,
    rewarder,
  });
}

/**
 * Get the stake accounts for a primary miner
 */
export async function getPrimaryStakeAccounts({
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
    tokenMint: mergePool.data.primaryMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: mergePool.data.primaryMint,
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
