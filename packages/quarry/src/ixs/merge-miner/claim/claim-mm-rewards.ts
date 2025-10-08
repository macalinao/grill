import type { Instruction } from "@solana/kit";
import type { ClaimMMRewardsArgs } from "./types.js";
import { getWithdrawTokensMMInstructionAsync } from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { claimMMRewardsNoWithdraw } from "./claim-mm-rewards-no-withdraw.js";

/**
 * Creates instructions to claim rewards from a quarry through a merge miner.
 * This includes:
 * 1. Creating necessary associated token accounts
 * 2. Claiming the rewards
 * 3. Withdrawing the rewards tokens from the merge miner to the owner
 */
export async function claimMMRewards({
  quarryMint,
  stake,
  mmOwner,
  rewarder,
}: ClaimMMRewardsArgs): Promise<Instruction[]> {
  // Get or create associated token accounts for the owner
  const [ownerRewardsTokenAccount] = await findAssociatedTokenPda({
    mint: rewarder.data.rewardsTokenMint,
    owner: mmOwner.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return [
    // 1-3. Claim rewards (without withdrawal)
    ...(await claimMMRewardsNoWithdraw({
      quarryMint,
      stake,
      payer: mmOwner,
      rewarder,
    })),
    // 4. Create owner rewards token account (idempotent)
    getCreateAssociatedTokenIdempotentInstruction({
      payer: mmOwner,
      ata: ownerRewardsTokenAccount,
      owner: mmOwner.address,
      mint: rewarder.data.rewardsTokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
    // 5. Withdraw rewards tokens from merge miner to owner
    await getWithdrawTokensMMInstructionAsync({
      owner: mmOwner,
      pool: stake.pool,
      withdrawMint: rewarder.data.rewardsTokenMint,
      tokenDestination: ownerRewardsTokenAccount,
    }),
  ];
}
