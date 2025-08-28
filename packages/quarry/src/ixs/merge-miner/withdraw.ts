import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "./claim-rewards.js";
import type {
  RescueTokensMergeMinerArgs,
  UnstakePrimaryMinerArgs,
} from "./types.js";
import {
  findMergeMinerPda,
  getRescueTokensMMInstruction,
  getUnstakePrimaryMinerInstruction,
  getWithdrawTokensMMInstruction,
  QUARRY_MINE_PROGRAM_ADDRESS,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "./helpers.js";
import {
  createStakeReplicaMinerIx,
  createUnstakeAllReplicaMinerIx,
} from "./replica.js";

/**
 * Arguments for depositing tokens into a merge miner
 */
export interface WithdrawMergeMinerArgs {
  amount: bigint;
  rewarder: Address;
  replicaRewarders?: Address[];
  mergePool: MergePoolAccount;
  /**
   * Owner of the merge miner
   */
  owner: TransactionSigner;
  /**
   * Payer of the instructions
   */
  payer?: TransactionSigner;
  /**
   * Destination of the tokens, defaults to the owner's primary ATA
   */
  tokenDestination?: Address;
}

/**
 * Withdraws tokens from a merge miner.
 */
export async function createWithdrawMergeMinerIxs({
  mergePool,
  tokenDestination,
  rewarder,
  replicaRewarders = [],
  amount,
  owner,
  payer = owner,
}: WithdrawMergeMinerArgs): Promise<Instruction[]> {
  const [mmTokenAccount] = await findAssociatedTokenPda({
    mint: mergePool.data.primaryMint,
    owner: owner.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Get merge miner address
  const [mmAddress] = await findMergeMinerPda({
    pool: mergePool.address,
    owner: owner.address,
  });

  const ixs = [
    // Unstake all replica tokens from the merge miner
    ...(await Promise.all(
      replicaRewarders.map(
        async (replicaRewarder) =>
          await createUnstakeAllReplicaMinerIx({
            mmOwner: owner,
            pool: mergePool.address,
            mm: mmAddress,
            rewarder: replicaRewarder,
            replicaMint: mergePool.data.replicaMint,
          }),
      ),
    )),
    await createUnstakePrimaryMinerIx({
      mmOwner: owner,
      pool: mergePool.address,
      mm: mmAddress,
      rewarder,
      primaryMint: mergePool.data.primaryMint,
      amount,
    }),
    // Stake replica tokens back into the merge miner
    ...(await Promise.all(
      replicaRewarders.map(
        async (replicaRewarder) =>
          await createStakeReplicaMinerIx({
            mmOwner: owner,
            pool: mergePool.address,
            mm: mmAddress,
            rewarder: replicaRewarder,
            replicaMint: mergePool.data.replicaMint,
          }),
      ),
    )),
  ];

  if (!tokenDestination) {
    // Get destination token account
    const [destinationATA] = await findAssociatedTokenPda({
      mint: mergePool.data.primaryMint,
      owner: tokenDestination ?? owner.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    ixs.push(
      getCreateAssociatedTokenIdempotentInstruction({
        payer,
        ata: destinationATA,
        owner: owner.address,
        mint: mergePool.data.primaryMint,
      }),
    );
    tokenDestination = destinationATA;
  }

  const withdrawIx = getWithdrawTokensMMInstruction({
    owner,
    pool: mergePool.address,
    mm: mmAddress,
    mmTokenAccount,
    withdrawMint: mergePool.data.primaryMint,
    tokenDestination,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  ixs.push(withdrawIx);

  return ixs;
}

/**
 * Creates an instruction to rescue stuck tokens from a merge miner
 */
export function createRescueTokensMergeMinerIx({
  mmOwner,
  mergePool,
  mm,
  miner,
  minerTokenAccount,
  destinationTokenAccount,
}: RescueTokensMergeMinerArgs): Instruction {
  return getRescueTokensMMInstruction({
    mmOwner,
    mergePool,
    mm,
    miner,
    minerTokenAccount,
    destinationTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
    quarryMineProgram: QUARRY_MINE_PROGRAM_ADDRESS,
  });
}

/**
 * Creates an instruction to unstake primary tokens from the merge miner
 */
async function createUnstakePrimaryMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  primaryMint,
  amount,
}: UnstakePrimaryMinerArgs): Promise<Instruction> {
  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: primaryMint,
    authority: mm,
  });

  const [mmPrimaryTokenAccount] = await findAssociatedTokenPda({
    mint: primaryMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getUnstakePrimaryMinerInstruction({
    mmOwner,
    mmPrimaryTokenAccount,
    pool,
    mm,
    rewarder,
    quarry: minerAddresses.quarry,
    miner: minerAddresses.miner,
    minerVault: minerAddresses.minerVault,
    amount,
  });
}
