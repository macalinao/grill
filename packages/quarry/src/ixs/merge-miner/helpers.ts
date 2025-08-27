import type { Address } from "@solana/kit";
import type { MinerAddresses } from "./types.js";
import {
  findMergeMinerPda,
  findMergePoolPda,
  findMinerPda,
  findQuarryPda,
  findReplicaMintPda,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

/**
 * Helper to get the merge pool and replica mint PDAs
 */
export async function getMergePoolAddresses({
  primaryMint,
}: {
  primaryMint: Address;
}): Promise<{
  pool: Address;
  replicaMint: Address;
}> {
  const [pool] = await findMergePoolPda({
    primaryMint,
  });

  const [replicaMint] = await findReplicaMintPda({
    pool,
  });

  return { pool, replicaMint };
}

/**
 * Helper to get the merge miner PDA
 */
export async function getMergeMinerAddress({
  pool,
  owner,
}: {
  pool: Address;
  owner: Address;
}): Promise<Address> {
  const [mm] = await findMergeMinerPda({
    pool,
    owner,
  });
  return mm;
}

/**
 * Helper to derive miner addresses from a mint and authority
 */
export async function getMinerAddresses({
  rewarder,
  mint,
  authority,
}: {
  rewarder: Address;
  mint: Address;
  authority: Address;
}): Promise<MinerAddresses> {
  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: mint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return {
    rewarder,
    quarry,
    miner,
    minerVault,
  };
}
