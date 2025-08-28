import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "./claim-rewards.js";
import {
  findMergeMinerPda,
  getStakePrimaryMinerInstruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "./helpers.js";
import { getCreateInitMergeMinerIxs } from "./init.js";

/**
 * Arguments for depositing tokens into a merge miner
 */
export interface DepositMergeMinerArgs {
  amount: bigint;
  rewarder: Address;
  mergePool: MergePoolAccount;
  mmOwner?: TransactionSigner;
  payer: TransactionSigner;
}

/**
 * Creates instructions to deposit primary tokens into a merge miner
 * This function will:
 * 1. Initialize the merge miner if it doesn't exist
 * 2. Initialize the primary miner if it doesn't exist
 * 3. Transfer tokens from user to merge miner
 * 4. Stake the tokens in the primary quarry
 *
 * @param amount - Amount of tokens to deposit
 * @param rewarder - The rewarder address
 * @param mergePool - The merge pool account data
 * @param mmOwner - The merge miner owner (defaults to payer)
 * @param payer - The transaction signer who will pay for initialization
 * @returns Promise resolving to instructions array
 */
export async function createDepositMergeMinerIxs({
  amount,
  rewarder,
  mergePool,
  payer,
  mmOwner = payer,
}: DepositMergeMinerArgs): Promise<{
  ixs: Instruction[];
}> {
  const instructions: Instruction[] = [];

  // Get user's token account for the primary mint
  const [userTokenAccount] = await findAssociatedTokenPda({
    mint: mergePool.data.primaryMint,
    owner: mmOwner.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Initialize merge miner and primary miner if needed
  const { ixs: initIxs } = await getCreateInitMergeMinerIxs({
    rewarder,
    mergePool,
    owner: mmOwner.address,
    payer,
  });
  instructions.push(...initIxs);

  // Get merge miner address
  const [mmAddress] = await findMergeMinerPda({
    pool: mergePool.address,
    owner: mmOwner.address,
  });

  // Get merge miner's token account for the primary mint
  const [mmPrimaryTokenAccount] = await findAssociatedTokenPda({
    mint: mergePool.data.primaryMint,
    owner: mmAddress,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Create merge miner's token account if needed
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: mmPrimaryTokenAccount,
      owner: mmAddress,
      mint: mergePool.data.primaryMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // Transfer tokens from user to merge miner
  instructions.push(
    getTransferInstruction({
      source: userTokenAccount,
      destination: mmPrimaryTokenAccount,
      authority: mmOwner,
      amount,
    }),
  );

  // Stake tokens in the primary quarry
  const stakeIx = await createStakePrimaryMinerIx({
    mmOwner,
    pool: mergePool.address,
    mm: mmAddress,
    rewarder,
    primaryMint: mergePool.data.primaryMint,
  });
  instructions.push(stakeIx);

  return {
    ixs: instructions,
  };
}

/**
 * Creates an instruction to stake tokens in the primary miner
 */
async function createStakePrimaryMinerIx({
  mmOwner,
  pool,
  mm,
  rewarder,
  primaryMint,
}: {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  primaryMint: Address;
}): Promise<Instruction> {
  // Get miner addresses
  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: primaryMint,
    authority: mm,
  });

  // Get merge miner's token account
  const [mmPrimaryTokenAccount] = await findAssociatedTokenPda({
    mint: primaryMint,
    owner: mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getStakePrimaryMinerInstruction({
    mmOwner,
    mmPrimaryTokenAccount,
    pool,
    mm,
    rewarder,
    quarry: minerAddresses.quarry,
    miner: minerAddresses.miner,
    minerVault: minerAddresses.minerVault,
  });
}
