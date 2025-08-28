import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findRewarderPda,
  getNewRewarderV2InstructionAsync,
} from "@macalinao/clients-quarry";
import { generateKeyPairSigner } from "@solana/signers";

/**
 * Creates an instruction to create a new rewarder
 *
 * @param mintWrapper - The mint wrapper address
 * @param rewardsTokenMint - The rewards token mint address
 * @param claimFeeTokenAccount - The claim fee token account address
 * @param initialAuthority - The initial authority for the rewarder (defaults to payer.address)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to the create rewarder instruction and rewarder address
 */
export async function createRewarderIx({
  mintWrapper,
  rewardsTokenMint,
  claimFeeTokenAccount,
  initialAuthority,
  payer,
}: {
  mintWrapper: Address;
  rewardsTokenMint: Address;
  claimFeeTokenAccount: Address;
  initialAuthority?: Address;
  payer: TransactionSigner;
}): Promise<{
  ix: Instruction;
  rewarder: Address;
}> {
  const base = await generateKeyPairSigner();
  const actualInitialAuthority = initialAuthority ?? payer.address;

  const [rewarder] = await findRewarderPda({ base: base.address });

  const ix = await getNewRewarderV2InstructionAsync({
    base,
    rewarder,
    initialAuthority: actualInitialAuthority,
    payer,
    mintWrapper,
    rewardsTokenMint,
    claimFeeTokenAccount,
  });

  return {
    ix,
    rewarder,
  };
}
