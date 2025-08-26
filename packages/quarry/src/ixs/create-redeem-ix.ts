import {
  findRedeemerPda,
  getRedeemTokensInstruction,
} from "@macalinao/clients-quarry";
import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

export interface RedeemTokenArgs {
  tokenAmount: bigint;
  sourceAuthority: TransactionSigner;
  iouSource: Address;
  redemptionDestination: Address;
  iouMint: Address;
  redemptionMint: Address;
}

/**
 * Creates a redeem tokens instruction
 * @param args The arguments for redeeming tokens
 * @returns The redeem tokens instruction
 */
export async function createRedeemIx({
  tokenAmount,
  sourceAuthority,
  iouSource,
  redemptionDestination,
  iouMint,
  redemptionMint,
}: RedeemTokenArgs): Promise<Instruction> {
  // Find the redeemer PDA
  const [redeemer] = await findRedeemerPda({
    iouMint,
    redemptionMint,
  });

  // Compute the redemption vault (ATA of redeemer for redemption mint)
  const [redemptionVault] = await findAssociatedTokenPda({
    mint: redemptionMint,
    owner: redeemer,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getRedeemTokensInstruction({
    redeemer,
    sourceAuthority,
    iouMint,
    iouSource,
    redemptionVault,
    redemptionDestination,
    amount: tokenAmount,
  });
}
