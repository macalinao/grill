import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type {
  InitMergeMinerArgs,
  InitMinerForMergeMinerArgs,
} from "./types.js";
import {
  findMergeMinerPda,
  findMinerPda,
  findQuarryPda,
  findReplicaMintPda,
  getInitMergeMinerV2Instruction,
  getInitMinerMMV2Instruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "./helpers.js";

/**
 * Creates an instruction to initialize a merge miner
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
 * Creates an instruction to initialize a miner for a merge miner (for replica quarry)
 */
export async function createInitMinerForMergeMinerIx({
  pool,
  mm,
  rewarder,
  tokenMint,
  payer,
}: InitMinerForMergeMinerArgs): Promise<Instruction> {
  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: tokenMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return getInitMinerMMV2Instruction({
    pool,
    mm,
    payer,
    rewarder,
    miner,
    quarry,
    tokenMint,
    minerVault,
  });
}

/**
 * Creates instructions to initialize the primary miner for a merge miner
 * Includes creating the associated token account for the miner vault
 */
export async function getInitPrimaryMinerIxs({
  rewarder,
  primaryMint,
  mergePool,
  mm,
  payer,
}: {
  rewarder: Address;
  primaryMint: Address;
  mergePool: Address;
  mm: Address;
  payer: TransactionSigner;
}): Promise<Instruction[]> {
  const minerAddresses = await getMinerAddresses({
    rewarder,
    mint: primaryMint,
    authority: mm,
  });

  const instructions: Instruction[] = [];

  // Create associated token account for the miner vault
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: minerAddresses.minerVault,
      owner: minerAddresses.miner,
      mint: primaryMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // Initialize the miner
  instructions.push(
    getInitMinerMMV2Instruction({
      pool: mergePool,
      mm,
      payer,
      rewarder,
      miner: minerAddresses.miner,
      quarry: minerAddresses.quarry,
      tokenMint: primaryMint,
      minerVault: minerAddresses.minerVault,
    }),
  );

  return instructions;
}

/**
 * Creates instructions to initialize a replica miner for a merge miner
 * Includes creating the associated token account for the miner vault
 */
export async function getInitReplicaMinerIxs({
  rewarder,
  mergePool,
  mm,
  payer,
}: {
  rewarder: Address;
  mergePool: Address;
  mm: Address;
  payer: TransactionSigner;
}): Promise<Instruction[]> {
  // Derive the replica mint from the merge pool
  const [replicaMint] = await findReplicaMintPda({
    pool: mergePool,
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
    getInitMinerMMV2Instruction({
      pool: mergePool,
      mm,
      payer,
      rewarder,
      miner: minerAddresses.miner,
      quarry: minerAddresses.quarry,
      tokenMint: replicaMint,
      minerVault: minerAddresses.minerVault,
    }),
  );

  return instructions;
}
