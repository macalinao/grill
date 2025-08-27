import type { Instruction } from "@solana/kit";
import type {
  UnstakeAllReplicaMinerArgs,
  UnstakePrimaryMinerArgs,
} from "./types.js";
import {
  findMinerPda,
  findQuarryPda,
  getUnstakeAllReplicaMinerInstruction,
  getUnstakePrimaryMinerInstruction,
  QUARRY_MINE_PROGRAM_ADDRESS,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

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
  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: primaryMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: primaryMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
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
    quarry,
    miner,
    minerVault,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
    mineProgram: QUARRY_MINE_PROGRAM_ADDRESS,
    amount,
  });
}

/**
 * Creates an instruction to unstake all replica tokens from the merge miner
 */
export async function createUnstakeAllReplicaMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  replicaMint,
}: UnstakeAllReplicaMinerArgs): Promise<Instruction> {
  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: replicaMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: replicaMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [replicaMintTokenAccount] = await findAssociatedTokenPda({
    mint: replicaMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getUnstakeAllReplicaMinerInstruction({
    mmOwner,
    replicaMint,
    replicaMintTokenAccount,
    pool,
    mm,
    rewarder,
    quarry,
    miner,
    minerVault,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
    mineProgram: QUARRY_MINE_PROGRAM_ADDRESS,
  });
}
