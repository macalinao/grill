import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findMinterPda,
  findOperatorPda,
  findRedeemerPda,
  findRewarderPda,
  getCreateOperatorV2InstructionAsync,
  getCreateRedeemerInstructionAsync,
  getMinterUpdateInstruction,
  getNewMinterV2InstructionAsync,
  getNewRewarderV2InstructionAsync,
  getTransferAuthorityInstruction,
} from "@macalinao/clients-quarry";
import { U64_MAX } from "@macalinao/gill-extra";
import { generateKeyPairSigner } from "@solana/kit";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Initialize an IOU rewarder for an existing mint wrapper.
 * The rewarder created will also have an operator.
 *
 * @param mintWrapper - The address of the mint wrapper
 * @param iouMint - The IOU mint address (from the mint wrapper)
 * @param underlyingMint - The underlying mint to redeem to
 * @param payer - The transaction signer who will pay for the account creation
 * @param rewarderBase - Optional base for the rewarder PDA
 * @returns Instructions to initialize the rewarder and related accounts
 */
export const initIouRewarder = async ({
  mintWrapper,
  iouMint,
  underlyingMint,
  payer,
  rewarderBase: maybeRewarderBase,
  operatorBase: maybeOperatorBase,
}: {
  mintWrapper: Address;
  iouMint: Address;
  underlyingMint: Address;
  payer: TransactionSigner;
  rewarderBase?: TransactionSigner;
  operatorBase?: TransactionSigner;
}): Promise<{
  instructions: Instruction[];
  accounts: {
    redeemer: Address;
    rewarder: Address;
    minter: Address;
    claimFeeTokenAccount: Address;
    operator: Address;
  };
}> => {
  const rewarderBase = maybeRewarderBase ?? (await generateKeyPairSigner());
  const operatorBase = maybeOperatorBase ?? (await generateKeyPairSigner());

  // Find PDAs
  const [redeemerPda, redeemerBump] = await findRedeemerPda({
    iouMint,
    redemptionMint: underlyingMint,
  });

  const [rewarderPda] = await findRewarderPda({
    base: rewarderBase.address,
  });

  const [minterPda] = await findMinterPda({
    wrapper: mintWrapper,
    authority: rewarderPda,
  });

  const [operatorPda] = await findOperatorPda({
    base: operatorBase.address,
  });

  const [claimFeeTokenAccount] = await findAssociatedTokenPda({
    mint: iouMint,
    owner: rewarderPda,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const instructions: Instruction[] = [
    // Create redeemer
    await getCreateRedeemerInstructionAsync({
      payer,
      iouMint,
      redemptionMint: underlyingMint,
      redeemer: redeemerPda,
      bump: redeemerBump,
    }),
    // Create rewarder claim fees token account
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: claimFeeTokenAccount,
      owner: rewarderPda,
      mint: iouMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
    // Create rewarder
    await getNewRewarderV2InstructionAsync({
      payer,
      base: rewarderBase,
      mintWrapper,
      claimFeeTokenAccount,
      initialAuthority: payer.address,
      rewardsTokenMint: iouMint,
    }),
    // Create minter for rewarder
    await getNewMinterV2InstructionAsync({
      mintWrapper,
      admin: payer,
      payer,
      newMinterAuthority: rewarderPda,
    }),
    // Set minter allowance to max
    getMinterUpdateInstruction({
      mintWrapper,
      admin: payer,
      minter: minterPda,
      allowance: U64_MAX,
    }),
    // Transfer authority to operator
    getTransferAuthorityInstruction({
      rewarder: rewarderPda,
      authority: payer,
      newAuthority: operatorPda,
    }),
    // Set up operator
    await getCreateOperatorV2InstructionAsync({
      payer,
      base: operatorBase,
      rewarder: rewarderPda,
      admin: payer.address,
    }),
  ];

  return {
    instructions,
    accounts: {
      redeemer: redeemerPda,
      rewarder: rewarderPda,
      minter: minterPda,
      claimFeeTokenAccount,
      operator: operatorPda,
    },
  };
};
