import type { Instruction } from "@solana/instructions";
import type { RescueTokensMergeMinerArgs } from "./types.js";
import { getRescueTokensMMInstruction } from "@solana-programs/quarry";

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
  });
}
