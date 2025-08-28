import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MergeMinerAmountArgs } from "./types.js";
import {
  findMergeMinerPda,
  getWithdrawTokensMMInstruction,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import {
  createStakeReplicaMinerIx,
  createUnstakeAllReplicaMinerIx,
  createUnstakePrimaryMinerIx,
} from "./miner.js";

/**
 * Arguments for withdrawing tokens from a merge miner
 */
export interface WithdrawMergeMinerArgs extends MergeMinerAmountArgs {
  /** Owner of the merge miner */
  owner: TransactionSigner;
  /** Destination of the tokens, defaults to the owner's primary ATA */
  tokenDestination?: Address;
}

/**
 * Withdraws tokens from a merge miner.
 */
export async function createWithdrawMergeMinerIxs({
  mergePool,
  tokenDestination,
  rewarder,
  replicaRewarders = [],
  amount,
  owner,
  payer,
}: WithdrawMergeMinerArgs): Promise<Instruction[]> {
  const [mmTokenAccount] = await findAssociatedTokenPda({
    mint: mergePool.data.primaryMint,
    owner: owner.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Get merge miner address
  const [mmAddress] = await findMergeMinerPda({
    pool: mergePool.address,
    owner: owner.address,
  });

  const ixs = [
    // Unstake all replica tokens from the merge miner
    ...(await Promise.all(
      replicaRewarders.map(
        async (replicaRewarder) =>
          await createUnstakeAllReplicaMinerIx({
            mmOwner: owner,
            pool: mergePool.address,
            mm: mmAddress,
            rewarder: replicaRewarder,
            replicaMint: mergePool.data.replicaMint,
          }),
      ),
    )),
    await createUnstakePrimaryMinerIx({
      mmOwner: owner,
      pool: mergePool.address,
      mm: mmAddress,
      rewarder,
      primaryMint: mergePool.data.primaryMint,
      amount,
    }),
    // Stake replica tokens back into the merge miner
    ...(await Promise.all(
      replicaRewarders.map(
        async (replicaRewarder) =>
          await createStakeReplicaMinerIx({
            mmOwner: owner,
            pool: mergePool.address,
            mm: mmAddress,
            rewarder: replicaRewarder,
            replicaMint: mergePool.data.replicaMint,
          }),
      ),
    )),
  ];

  if (!tokenDestination) {
    // Get destination token account
    const [destinationATA] = await findAssociatedTokenPda({
      mint: mergePool.data.primaryMint,
      owner: tokenDestination ?? owner.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    ixs.push(
      getCreateAssociatedTokenIdempotentInstruction({
        payer,
        ata: destinationATA,
        owner: owner.address,
        mint: mergePool.data.primaryMint,
      }),
    );
    tokenDestination = destinationATA;
  }

  const withdrawIx = getWithdrawTokensMMInstruction({
    owner,
    pool: mergePool.address,
    mm: mmAddress,
    mmTokenAccount,
    withdrawMint: mergePool.data.primaryMint,
    tokenDestination,
  });
  ixs.push(withdrawIx);

  return ixs;
}
