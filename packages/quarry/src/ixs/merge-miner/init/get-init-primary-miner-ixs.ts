import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "../claim-rewards.js";
import type { MinerAddresses } from "../types.js";
import { findMergeMinerPda } from "@macalinao/clients-quarry";
import {
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "../helpers.js";
import { createInitMinerForMergeMinerIxFromAddresses } from "./create-init-miner-for-merge-miner-from-addresses.js";

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
