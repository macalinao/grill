import type { Instruction } from "@solana/kit";
import type {
  ClaimMergeMinerRewardsHelperArgs,
  ClaimRewardsMergeMinerArgs,
} from "./types.js";
import {
  findMinerPda,
  findMinterPda,
  findQuarryPda,
  getClaimRewardsMMInstruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Creates an instruction to claim rewards from a merge miner
 */
export function createClaimRewardsMergeMinerIx({
  mintWrapper,
  minter,
  rewardsTokenMint,
  rewardsTokenAccount,
  claimFeeTokenAccount,
  stakeTokenAccount,
  pool,
  mm,
  rewarder,
  quarry,
  miner,
  minerVault,
}: ClaimRewardsMergeMinerArgs): Instruction {
  return getClaimRewardsMMInstruction({
    mintWrapper,
    minter,
    rewardsTokenMint,
    rewardsTokenAccount,
    claimFeeTokenAccount,
    stakeTokenAccount,
    pool,
    mm,
    rewarder,
    quarry,
    miner,
    minerVault,
  });
}

/**
 * Helper function to create a claim rewards instruction with derived accounts
 */
export async function createClaimMergeMinerRewardsHelperIx({
  mintWrapper,
  rewarder,
  rewardsTokenMint,
  claimFeeTokenAccount,
  pool,
  mm,
  quarryMint,
}: ClaimMergeMinerRewardsHelperArgs): Promise<Instruction> {
  const [minter] = await findMinterPda({
    wrapper: mintWrapper,
    authority: rewarder,
  });

  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: quarryMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: quarryMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [rewardsTokenAccount] = await findAssociatedTokenPda({
    mint: rewardsTokenMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [stakeTokenAccount] = await findAssociatedTokenPda({
    mint: quarryMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return createClaimRewardsMergeMinerIx({
    mintWrapper,
    minter,
    rewardsTokenMint,
    rewardsTokenAccount,
    claimFeeTokenAccount,
    stakeTokenAccount,
    pool,
    mm,
    rewarder,
    quarry,
    miner,
    minerVault,
  });
}
