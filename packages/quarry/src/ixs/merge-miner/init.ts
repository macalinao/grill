import type { Instruction } from "@solana/kit";
import type {
  InitMergeMinerArgs,
  InitMinerForMergeMinerArgs,
} from "./types.js";
import {
  findMergeMinerPda,
  findMinerPda,
  findQuarryPda,
  getInitMergeMinerV2Instruction,
  getInitMinerMMV2Instruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Creates an instruction to initialize a merge miner
 */
export async function createInitMergeMinerIx({
  pool,
  owner,
  payer,
}: InitMergeMinerArgs): Promise<Instruction> {
  const [mm] = await findMergeMinerPda({
    pool,
    owner,
  });

  return getInitMergeMinerV2Instruction({
    pool,
    owner,
    mm,
    payer,
  });
}

/**
 * Creates an instruction to initialize a miner for a merge miner (for replica quarry)
 */
export async function createInitMinerForMergeMinerIx({
  pool,
  mm,
  rewarder,
  tokenMint,
  payer,
}: InitMinerForMergeMinerArgs): Promise<Instruction> {
  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: tokenMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getInitMinerMMV2Instruction({
    pool,
    mm,
    payer,
    rewarder,
    miner,
    quarry,
    tokenMint,
    minerVault,
  });
}
