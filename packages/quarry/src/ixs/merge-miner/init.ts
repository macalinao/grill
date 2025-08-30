import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "./claim-rewards.js";
import type { InitMergeMinerArgs, MinerAddresses } from "./types.js";
import {
  findMergeMinerPda,
  findReplicaMintPda,
  getInitMergeMinerV2Instruction,
  getInitMinerMMV2Instruction,
} from "@macalinao/clients-quarry";
import {
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "./helpers.js";

/**
 * Creates an instruction to initialize a merge miner
 *
 * @param pool - The merge pool address
 * @param owner - The owner of the merge miner
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to the initialization instruction
 */
export async function createInitMergeMinerIx({
  pool,
  owner,
  payer,
}: InitMergeMinerArgs): Promise<Instruction> {
  const [mm] = await findMergeMinerPda({
    pool,
    owner,
  });

  return getInitMergeMinerV2Instruction({
    pool,
    owner,
    mm,
    payer,
  });
}

/**
 * Creates an instruction to initialize a miner for a merge miner using pre-computed addresses
 * This is a helper function that avoids re-deriving addresses when they are already available
 *
 * @param pool - The merge pool address
 * @param mm - The merge miner address
 * @param tokenMint - The token mint address for the miner
 * @param minerAddresses - Pre-computed miner addresses (rewarder, quarry, miner, minerVault)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns The miner initialization instruction
 */
function createInitMinerForMergeMinerIxFromAddresses({
  pool,
  mm,
  tokenMint,
  minerAddresses,
  payer,
}: {
  pool: Address;
  mm: Address;
  tokenMint: Address;
  minerAddresses: MinerAddresses;
  payer: TransactionSigner;
}): Instruction {
  return getInitMinerMMV2Instruction({
    pool,
    mm,
    payer,
    rewarder: minerAddresses.rewarder,
    miner: minerAddresses.miner,
    quarry: minerAddresses.quarry,
    tokenMint,
    minerVault: minerAddresses.minerVault,
  });
}

/**
 * Creates instructions to initialize both a merge miner and its primary miner
 * This is a convenience function that combines merge miner creation with primary miner setup
 *
 * @param rewarder - The rewarder program address
 * @param mergePool - The merge pool account containing address and mint data
 * @param owner - The owner of the merge miner (defaults to payer.address if not provided)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to instructions array and miner addresses
 */
export async function getCreateInitMergeMinerIxs({
  rewarder,
  mergePool,
  owner,
  payer,
}: {
  rewarder: Address;
  mergePool: MergePoolAccount;
  owner?: Address;
  payer: TransactionSigner;
}): Promise<{
  ixs: Instruction[];
  minerAddresses: MinerAddresses;
}> {
  const actualOwner = owner ?? payer.address;
  const instructions: Instruction[] = [];

  // Step 1: Initialize the merge miner
  instructions.push(
    await createInitMergeMinerIx({
      pool: mergePool.address,
      owner: actualOwner,
      payer,
    }),
  );

  // Step 2: Initialize the primary miner and get its addresses
  const { ixs: primaryMinerIxs, minerAddresses } = await getInitPrimaryMinerIxs(
    {
      rewarder,
      mergePool,
      owner: actualOwner,
      payer,
    },
  );

  // Add the primary miner instructions
  instructions.push(...primaryMinerIxs);

  return {
    ixs: instructions,
    minerAddresses,
  };
}

/**
 * Creates instructions to initialize the primary miner for a merge miner
 * Includes creating the associated token account for the miner vault
 *
 * @param rewarder - The rewarder program address
 * @param mergePool - The merge pool account containing address and mint data
 * @param owner - The owner of the merge miner (defaults to payer.address if not provided)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to instructions array and miner addresses
 */
export async function getInitPrimaryMinerIxs({
  rewarder,
  mergePool,
  owner,
  payer,
}: {
  rewarder: Address;
  mergePool: MergePoolAccount;
  owner?: Address;
  payer: TransactionSigner;
}): Promise<{
  ixs: Instruction[];
  minerAddresses: MinerAddresses;
}> {
  const actualOwner = owner ?? payer.address;

  // Derive the merge miner from pool and owner
  const [mm] = await findMergeMinerPda({
    pool: mergePool.address,
    owner: actualOwner,
  });

  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: mergePool.data.primaryMint,
    authority: mm,
  });

  const instructions: Instruction[] = [];

  // Create associated token account for the miner vault
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: minerAddresses.minerVault,
      owner: minerAddresses.miner,
      mint: mergePool.data.primaryMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // Initialize the miner
  instructions.push(
    createInitMinerForMergeMinerIxFromAddresses({
      pool: mergePool.address,
      mm,
      tokenMint: mergePool.data.primaryMint,
      minerAddresses,
      payer,
    }),
  );

  return {
    ixs: instructions,
    minerAddresses,
  };
}

/**
 * Creates instructions to initialize a replica miner for a merge miner
 * Includes creating the associated token account for the miner vault
 *
 * @param rewarder - The rewarder program address
 * @param mergePool - The merge pool account containing address and mint data
 * @param owner - The owner of the merge miner (defaults to payer.address if not provided)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to instructions array and miner addresses
 */
export async function getInitReplicaMinerIxs({
  rewarder,
  mergePool,
  owner,
  payer,
}: {
  rewarder: Address;
  mergePool: MergePoolAccount;
  owner?: Address;
  payer: TransactionSigner;
}): Promise<{
  ixs: Instruction[];
  minerAddresses: MinerAddresses;
}> {
  const actualOwner = owner ?? payer.address;

  // Derive the merge miner from pool and owner
  const [mm] = await findMergeMinerPda({
    pool: mergePool.address,
    owner: actualOwner,
  });

  // Derive the replica mint from the merge pool
  const [replicaMint] = await findReplicaMintPda({
    pool: mergePool.address,
  });

  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: replicaMint,
    authority: mm,
  });

  const instructions: Instruction[] = [];

  // Create associated token account for the miner vault
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: minerAddresses.minerVault,
      owner: minerAddresses.miner,
      mint: replicaMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // Initialize the miner
  instructions.push(
    createInitMinerForMergeMinerIxFromAddresses({
      pool: mergePool.address,
      mm,
      tokenMint: replicaMint,
      minerAddresses,
      payer,
    }),
  );

  return {
    ixs: instructions,
    minerAddresses,
  };
}
