import type { Instruction, TransactionSigner } from "@solana/kit";
import type { PoolRewardsInfoWithIouMint } from "../types.js";
import {
  findRedeemerPda,
  getRedeemAllTokensInstructionAsync,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCloseAccountInstruction,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Creates redemption instructions for IOU tokens to actual reward tokens.
 *
 * @param rewardsInfo - The pool rewards information containing token details (with IOU mint)
 * @param withdrawer - The transaction signer who will redeem the tokens
 * @returns Array of instructions to redeem IOU tokens
 */
export async function createRedeemIxs({
  rewardsInfo,
  withdrawer,
}: {
  rewardsInfo: PoolRewardsInfoWithIouMint;
  withdrawer: TransactionSigner;
}): Promise<Instruction[]> {
  const [iouSource] = await findAssociatedTokenPda({
    mint: rewardsInfo.iouMint,
    owner: withdrawer.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [redeemer] = await findRedeemerPda({
    iouMint: rewardsInfo.iouMint,
    redemptionMint: rewardsInfo.rewardsToken.mint,
  });

  const [redemptionVault] = await findAssociatedTokenPda({
    mint: rewardsInfo.rewardsToken.mint,
    owner: redeemer,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [redemptionDestination] = await findAssociatedTokenPda({
    mint: rewardsInfo.rewardsToken.mint,
    owner: withdrawer.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return [
    getCreateAssociatedTokenIdempotentInstruction({
      ata: redemptionDestination,
      mint: rewardsInfo.rewardsToken.mint,
      owner: withdrawer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
      payer: withdrawer,
    }),
    await getRedeemAllTokensInstructionAsync({
      redeemer,
      sourceAuthority: withdrawer,
      iouMint: rewardsInfo.iouMint,
      redemptionVault,
      redemptionDestination,
    }),
    getCloseAccountInstruction({
      account: iouSource,
      destination: withdrawer.address,
      owner: withdrawer,
    }),
  ];
}
