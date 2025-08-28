import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findMinterPda,
  getNewMinterV2Instruction,
} from "@macalinao/clients-quarry";

/**
 * Creates an instruction to create a new minter for a mint wrapper
 *
 * @param mintWrapper - The mint wrapper address
 * @param newMinterAuthority - The authority that will control the minter
 * @param admin - The admin authority for the mint wrapper
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to the create minter instruction and minter address
 */
export async function createMinterIx({
  mintWrapper,
  newMinterAuthority,
  admin,
  payer,
}: {
  mintWrapper: Address;
  newMinterAuthority: Address;
  admin: TransactionSigner;
  payer: TransactionSigner;
}): Promise<{
  ix: Instruction;
  minter: Address;
}> {
  const [minter] = await findMinterPda({
    wrapper: mintWrapper,
    authority: newMinterAuthority,
  });

  const ix = getNewMinterV2Instruction({
    mintWrapper,
    admin,
    newMinterAuthority,
    minter,
    payer,
  });

  return {
    ix,
    minter,
  };
}
