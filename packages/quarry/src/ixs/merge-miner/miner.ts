import type { Instruction } from "@solana/kit";
import type {
  StakePrimaryMinerArgs,
  StakeReplicaMinerArgs,
  UnstakeAllReplicaMinerArgs,
  UnstakePrimaryMinerArgs,
} from "./types.js";
import {
  getStakePrimaryMinerInstruction,
  getStakeReplicaMinerInstruction,
  getUnstakeAllReplicaMinerInstruction,
  getUnstakePrimaryMinerInstruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "./helpers.js";

/**
 * Creates an instruction to stake tokens in the primary miner
 */
export async function createStakePrimaryMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  primaryMint,
}: StakePrimaryMinerArgs): Promise<Instruction> {
  // Get miner addresses
  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: primaryMint,
    authority: mm,
  });

  // Get merge miner's token account
  const [mmPrimaryTokenAccount] = await findAssociatedTokenPda({
    mint: primaryMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getStakePrimaryMinerInstruction({
    mmOwner,
    mmPrimaryTokenAccount,
    pool,
    mm,
    rewarder,
    quarry: minerAddresses.quarry,
    miner: minerAddresses.miner,
    minerVault: minerAddresses.minerVault,
  });
}

/**
 * Creates an instruction to unstake primary tokens from the merge miner
 */
export async function createUnstakePrimaryMinerIx({
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

/**
 * Creates an instruction to stake replica tokens in a replica miner
 */
export async function createStakeReplicaMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  replicaMint,
}: StakeReplicaMinerArgs): Promise<Instruction> {
  // Get miner addresses
  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: replicaMint,
    authority: mm,
  });

  // Get merge miner's token account
  const [mmReplicaTokenAccount] = await findAssociatedTokenPda({
    mint: replicaMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getStakeReplicaMinerInstruction({
    replicaMintTokenAccount: mmReplicaTokenAccount,
    mmOwner,
    pool,
    mm,
    rewarder,
    quarry: minerAddresses.quarry,
    miner: minerAddresses.miner,
    minerVault: minerAddresses.minerVault,
    replicaMint,
  });
}

/**
 * Creates an instruction to unstake all replica tokens from a replica miner
 */
export async function createUnstakeAllReplicaMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  replicaMint,
}: UnstakeAllReplicaMinerArgs): Promise<Instruction> {
  // Get miner addresses
  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: replicaMint,
    authority: mm,
  });

  // Get merge miner's token account
  const [mmReplicaTokenAccount] = await findAssociatedTokenPda({
    mint: replicaMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getUnstakeAllReplicaMinerInstruction({
    mmOwner,
    replicaMint,
    replicaMintTokenAccount: mmReplicaTokenAccount,
    pool,
    mm,
    rewarder,
    quarry: minerAddresses.quarry,
    miner: minerAddresses.miner,
    minerVault: minerAddresses.minerVault,
  });
}
