import type { Address, Instruction } from "@solana/kit";
import type { TransactionSigner } from "@solana/signers";
import {
  getStakeReplicaMinerInstruction,
  getUnstakeAllReplicaMinerInstruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "./helpers.js";

/**
 * Creates an instruction to unstake all replica tokens from a replica miner
 */
export async function createUnstakeAllReplicaMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  replicaMint,
}: {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  replicaMint: Address;
}): Promise<Instruction> {
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

export async function createStakeReplicaMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  replicaMint,
}: {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  replicaMint: Address;
}): Promise<Instruction> {
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
