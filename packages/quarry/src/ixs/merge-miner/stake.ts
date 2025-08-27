import type { Instruction } from "@solana/kit";
import type { StakePrimaryMinerArgs, StakeReplicaMinerArgs } from "./types.js";
import {
  findMinerPda,
  findQuarryPda,
  getStakePrimaryMinerInstruction,
  getStakeReplicaMinerInstruction,
  QUARRY_MINE_PROGRAM_ADDRESS,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Creates an instruction to stake primary tokens into the merge miner
 */
export async function createStakePrimaryMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  primaryMint,
}: StakePrimaryMinerArgs): Promise<Instruction> {
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

  return getStakePrimaryMinerInstruction({
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
  });
}

/**
 * Creates an instruction to stake replica tokens into the merge miner
 */
export async function createStakeReplicaMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  replicaMint,
}: StakeReplicaMinerArgs): Promise<Instruction> {
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

  return getStakeReplicaMinerInstruction({
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
