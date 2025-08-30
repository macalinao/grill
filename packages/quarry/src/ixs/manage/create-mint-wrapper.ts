import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findMintWrapperPda,
  getNewWrapperInstructionAsync,
} from "@macalinao/clients-quarry";
import { generateKeyPairSigner } from "@solana/kit";

/**
 * Creates an instruction to create a new mint wrapper
 *
 * @param tokenMint - The token mint address to wrap
 * @param admin - The admin authority for the mint wrapper (defaults to payer.address)
 * @param hardCap - The hard cap for minting (maximum amount that can be minted)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to the create mint wrapper instruction and wrapper address
 */
export async function createMintWrapperIx({
  tokenMint,
  admin,
  hardCap,
  payer,
}: {
  tokenMint: Address;
  admin?: Address;
  hardCap: number | bigint;
  payer: TransactionSigner;
}): Promise<{
  ix: Instruction;
  mintWrapper: Address;
  bump: number;
}> {
  const base = await generateKeyPairSigner();
  const actualAdmin = admin ?? payer.address;

  const [mintWrapper, bump] = await findMintWrapperPda({
    base: base.address,
  });

  const ix = await getNewWrapperInstructionAsync({
    base,
    mintWrapper,
    admin: actualAdmin,
    tokenMint,
    payer,
    bump,
    hardCap,
  });

  return {
    ix,
    mintWrapper,
    bump,
  };
}
