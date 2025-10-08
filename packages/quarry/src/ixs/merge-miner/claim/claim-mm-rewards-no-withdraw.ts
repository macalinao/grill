import type { Instruction } from "@solana/kit";
import type { ClaimMMRewardsNoWithdrawArgs } from "./types.js";
import { getClaimRewardsMMInstructionAsync } from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Creates instructions to claim rewards from a quarry through a merge miner without withdrawing.
 * This is a permissionless function for cases where the claimer does not have authority over the merge miner.
 *
 * This includes:
 * 1. Creating necessary associated token accounts
 * 2. Claiming the rewards (without withdrawing them from the merge miner)
 */
export async function claimMMRewardsNoWithdraw({
  quarryMint,
  stake,
  payer,
  rewarder,
}: ClaimMMRewardsNoWithdrawArgs): Promise<Instruction[]> {
  // Get or create associated token accounts for the merge miner
  const [mmQuarryTokenAccount] = await findAssociatedTokenPda({
    mint: quarryMint,
    owner: stake.mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [mmRewardsTokenAccount] = await findAssociatedTokenPda({
    mint: rewarder.data.rewardsTokenMint,
    owner: stake.mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return [
    // 1. Create MM quarry token account (idempotent)
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: mmQuarryTokenAccount,
      owner: stake.mm,
      mint: quarryMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
    // 2. Create MM rewards token account (idempotent)
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: mmRewardsTokenAccount,
      owner: stake.mm,
      mint: rewarder.data.rewardsTokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
    // 3. Claim rewards instruction
    await getClaimRewardsMMInstructionAsync({
      mintWrapper: rewarder.data.mintWrapper,
      rewardsTokenMint: rewarder.data.rewardsTokenMint,
      stakeTokenAccount: mmQuarryTokenAccount,
      pool: stake.pool,
      mm: stake.mm,
      rewarder: stake.rewarder,
      quarry: stake.quarry,
      minerVault: stake.minerVault,
    }),
  ];
}
