import type { Instruction } from "@solana/kit";
import type { RescueTokensMergeMinerArgs } from "./types.js";
import { getRescueTokensMMInstruction } from "@macalinao/clients-quarry";

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
