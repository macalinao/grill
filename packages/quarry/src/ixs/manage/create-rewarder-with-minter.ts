import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { createMintWrapperIx } from "./create-mint-wrapper.js";
import { createMinterIx } from "./create-minter.js";
import { createRewarderIx } from "./create-rewarder.js";

/**
 * Creates instructions to create a complete rewarder setup with mint wrapper and minter
 * This is a convenience function that creates:
 * 1. A mint wrapper for the rewards token
 * 2. A minter for the mint wrapper
 * 3. A rewarder using the mint wrapper
 * 4. A claim fee token account for the rewarder
 *
 * @param rewardsTokenMint - The rewards token mint address
 * @param initialAuthority - The initial authority for the rewarder (defaults to payer.address)
 * @param admin - The admin authority for the mint wrapper (defaults to payer.address)
 * @param hardCap - The hard cap for minting (maximum amount that can be minted)
 * @param payer - The transaction signer who will pay for all initializations
 * @returns Promise resolving to instructions array and all created addresses
 */
export async function createRewarderWithMinterIxs({
  rewardsTokenMint,
  initialAuthority,
  admin,
  hardCap,
  payer,
}: {
  rewardsTokenMint: Address;
  initialAuthority?: Address;
  admin?: Address;
  hardCap: number | bigint;
  payer: TransactionSigner;
}): Promise<{
  ixs: Instruction[];
  mintWrapper: Address;
  minter: Address;
  rewarder: Address;
  claimFeeTokenAccount: Address;
}> {
  const actualInitialAuthority = initialAuthority ?? payer.address;
  const actualAdmin = admin ?? payer.address;
  const instructions: Instruction[] = [];

  // Step 1: Create mint wrapper
  const { ix: mintWrapperIx, mintWrapper } = await createMintWrapperIx({
    tokenMint: rewardsTokenMint,
    admin: actualAdmin,
    hardCap,
    payer,
  });
  instructions.push(mintWrapperIx);

  // Step 2: Create minter
  const { ix: minterIx, minter } = await createMinterIx({
    mintWrapper,
    newMinterAuthority: actualInitialAuthority,
    admin: { address: actualAdmin } as TransactionSigner,
    payer,
  });
  instructions.push(minterIx);

  // Step 3: Create claim fee token account
  const [claimFeeTokenAccount] = await findAssociatedTokenPda({
    mint: rewardsTokenMint,
    owner: actualInitialAuthority,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Create the claim fee token account
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: claimFeeTokenAccount,
      owner: actualInitialAuthority,
      mint: rewardsTokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // Step 4: Create rewarder
  const { ix: rewarderIx, rewarder } = await createRewarderIx({
    mintWrapper,
    rewardsTokenMint,
    claimFeeTokenAccount,
    initialAuthority: actualInitialAuthority,
    payer,
  });
  instructions.push(rewarderIx);

  return {
    ixs: instructions,
    mintWrapper,
    minter,
    rewarder,
    claimFeeTokenAccount,
  };
}
