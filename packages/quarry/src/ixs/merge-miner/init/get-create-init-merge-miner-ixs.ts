import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergePoolAccount } from "../claim-rewards.js";
import type { MinerAddresses } from "../types.js";
import {
  findMergeMinerPda,
  getInitMergeMinerV2InstructionAsync,
} from "@macalinao/clients-quarry";
import {
  getCreateAssociatedTokenIdempotentInstructionAsync,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getInitPrimaryMinerIxs } from "./get-init-primary-miner-ixs.js";
import { getInitReplicaMinerIxs } from "./get-init-replica-miner-ixs.js";

/**
 * Creates instructions to initialize both a merge miner and its primary miner
 * This is a convenience function that combines merge miner creation with primary miner setup
 *
 * @param rewarder - The rewarder program address
 * @param replicaRewarders - Array of replica rewarder addresses
 * @param mergePool - The merge pool account containing address and mint data
 * @param owner - The owner of the merge miner (defaults to payer.address if not provided)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns Promise resolving to instructions array and miner addresses
 */
export async function getCreateInitMergeMinerIxs({
  rewarder,
  replicaRewarders,
  mergePool,
  owner,
  payer,
}: {
  rewarder: Address;
  replicaRewarders: Address[];
  mergePool: MergePoolAccount;
  owner?: Address;
  payer: TransactionSigner;
}): Promise<{
  ixs: Instruction[];
  minerAddresses: MinerAddresses;
}> {
  const actualOwner = owner ?? payer.address;
  const instructions: Instruction[] = [
    // Step 1: Initialize the merge miner
    await getInitMergeMinerV2InstructionAsync({
      pool: mergePool.address,
      owner: actualOwner,
      payer,
    }),
  ];

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

  // Create associated token account for the replica mint if we have replica rewarders
  if (replicaRewarders.length > 0) {
    const [mm] = await findMergeMinerPda({
      pool: mergePool.address,
      owner: actualOwner,
    });
    instructions.push(
      await getCreateAssociatedTokenIdempotentInstructionAsync({
        payer,
        owner: mm,
        mint: mergePool.data.replicaMint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      }),
    );
  }

  for (const replicaRewarder of replicaRewarders) {
    const { ixs: replicaMinerIxs } = await getInitReplicaMinerIxs({
      rewarder: replicaRewarder,
      mergePool,
      owner: actualOwner,
      payer,
    });
    instructions.push(...replicaMinerIxs);
  }

  return {
    ixs: instructions,
    minerAddresses,
  };
}
