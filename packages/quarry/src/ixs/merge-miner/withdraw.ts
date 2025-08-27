import type { Instruction } from "@solana/kit";
import type {
  RescueTokensMergeMinerArgs,
  WithdrawTokensMergeMinerArgs,
} from "./types.js";
import {
  getRescueTokensMMInstruction,
  getWithdrawTokensMMInstruction,
  QUARRY_MINE_PROGRAM_ADDRESS,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Creates an instruction to withdraw tokens from a merge miner
 */
export async function createWithdrawTokensMergeMinerIx({
  owner,
  pool,
  mm,
  withdrawMint,
  tokenDestination,
}: WithdrawTokensMergeMinerArgs): Promise<Instruction> {
  const [mmTokenAccount] = await findAssociatedTokenPda({
    mint: withdrawMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getWithdrawTokensMMInstruction({
    owner,
    pool,
    mm,
    mmTokenAccount,
    withdrawMint,
    tokenDestination,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
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
