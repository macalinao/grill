import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount, MinerAddresses } from "../types.js";
import {
  findMergeMinerPda,
  findReplicaMintPda,
} from "@macalinao/clients-quarry";
import {
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinerAddresses } from "../helpers.js";
import { createInitMinerForMergeMinerIxFromAddresses } from "./create-init-miner-for-merge-miner-from-addresses.js";

/**
 * Creates instructions to initialize a replica miner for a merge miner
 * Includes creating the associated token account for the miner vault
 * Uses the replica mint derived from the merge pool
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

  const instructions: Instruction[] = [
    getCreateAssociatedTokenIdempotentInstruction({
      payer,
      ata: minerAddresses.minerVault,
      owner: minerAddresses.miner,
      mint: replicaMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
    createInitMinerForMergeMinerIxFromAddresses({
      pool: mergePool.address,
      mm,
      tokenMint: replicaMint,
      minerAddresses,
      payer,
    }),
  ];

  return {
    ixs: instructions,
    minerAddresses,
  };
}
