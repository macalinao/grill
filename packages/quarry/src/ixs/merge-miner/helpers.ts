import type { Address } from "@solana/kit";
import {
  findMergeMinerPda,
  findMergePoolPda,
  findReplicaMintPda,
} from "@macalinao/clients-quarry";

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
