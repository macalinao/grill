import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import type { NonEmptyArray } from "nonempty-array";
import type { PoolInfo, PoolRewardsInfo } from "./types.js";
import {
  findMergeMinerPda,
  findMergePoolPda,
  findMinerPda,
  findQuarryPda,
  findReplicaMintPda,
} from "@macalinao/clients-quarry";
import { assertNEA } from "nonempty-array";

export interface PoolRewardsAddresses {
  rewarder: Address;
  quarry: Address;
  rewardsToken: TokenInfo;
  iouMint: Address | null;
  miner: Address | null;
}

const buildPoolRewardsAddresses = async ({
  stakedTokenMint,
  rewards,
  authority,
}: {
  stakedTokenMint: Address;
  rewards: PoolRewardsInfo;
  authority: Address | null;
}): Promise<PoolRewardsAddresses> => {
  const rewarder = rewards.rewarder;
  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: stakedTokenMint,
  });
  const miner = authority
    ? (await findMinerPda({ quarry, authority }))[0]
    : null;
  return {
    rewarder,
    quarry,
    miner,
    iouMint: rewards.iouMint ?? null,
    rewardsToken: rewards.rewardsToken,
  };
};

const getAllMinersMergePool = async ({
  poolInfo,
  owner,
}: {
  poolInfo: PoolInfo & {
    secondaryRewards: readonly PoolRewardsInfo[];
  };
  owner?: Address | null;
}): Promise<QuarryMinerAddresses> => {
  // first, get the merge miner addresses
  const [mergePool] = await findMergePoolPda({
    primaryMint: poolInfo.stakedToken.mint,
  });
  const mergeMiner = owner
    ? (await findMergeMinerPda({ pool: mergePool, owner }))[0]
    : null;
  const mergeMine = {
    pool: mergePool,
    mergeMiner,
  };

  // first, primary miner
  const pools: PoolRewardsAddresses[] = [
    await buildPoolRewardsAddresses({
      stakedTokenMint: poolInfo.stakedToken.mint,
      rewards: poolInfo.primaryRewards,
      authority: mergeMiner,
    }),
  ];

  // next, all replicas
  const [replicaMint] = await findReplicaMintPda({
    pool: mergePool,
  });
  for (const secondary of poolInfo.secondaryRewards) {
    pools.push(
      await buildPoolRewardsAddresses({
        stakedTokenMint: replicaMint,
        rewards: secondary,
        authority: mergeMiner,
      }),
    );
  }

  return { pools: assertNEA(pools), mergeMine };
};

/**
 * The addresses of the Quarry miner for a given pool.
 */
export type QuarryMinerAddresses = Readonly<{
  pools: NonEmptyArray<PoolRewardsAddresses>;
  mergeMine?: Readonly<{
    pool: Address;
    mergeMiner: Address | null;
  }>;
}>;

export const getQuarryMinerAddresses = async ({
  poolInfo,
  owner = null,
}: {
  poolInfo: PoolInfo;
  owner?: Address | null;
}): Promise<QuarryMinerAddresses> => {
  if (poolInfo.secondaryRewards) {
    return getAllMinersMergePool({
      poolInfo: poolInfo as PoolInfo & {
        secondaryRewards: readonly PoolRewardsInfo[];
      },
      owner,
    });
  }

  // not merge mine, just do basic quarry
  return {
    pools: [
      await buildPoolRewardsAddresses({
        stakedTokenMint: poolInfo.stakedToken.mint,
        rewards: poolInfo.primaryRewards,
        authority: owner,
      }),
    ],
  };
};
