import type { Address, TransactionSigner } from "@solana/kit";

export interface InitMergeMinerArgs {
  pool: Address;
  owner: Address;
  payer: TransactionSigner;
}

export interface InitMinerForMergeMinerArgs {
  pool: Address;
  mm: Address;
  rewarder: Address;
  tokenMint: Address;
  payer: TransactionSigner;
}

export interface StakePrimaryMinerArgs {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  primaryMint: Address;
}

export interface StakeReplicaMinerArgs {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  replicaMint: Address;
}

export interface UnstakePrimaryMinerArgs {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  primaryMint: Address;
  amount: bigint;
}

export interface UnstakeAllReplicaMinerArgs {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  replicaMint: Address;
}

export interface ClaimRewardsMergeMinerArgs {
  mintWrapper: Address;
  minter: Address;
  rewardsTokenMint: Address;
  rewardsTokenAccount: Address;
  claimFeeTokenAccount: Address;
  stakeTokenAccount: Address;
  pool: Address;
  mm: Address;
  rewarder: Address;
  quarry: Address;
  miner: Address;
  minerVault: Address;
}

export interface ClaimMergeMinerRewardsHelperArgs {
  mintWrapper: Address;
  rewarder: Address;
  rewardsTokenMint: Address;
  claimFeeTokenAccount: Address;
  pool: Address;
  mm: Address;
  quarryMint: Address;
}

export interface WithdrawTokensMergeMinerArgs {
  owner: TransactionSigner;
  pool: Address;
  mm: Address;
  withdrawMint: Address;
  tokenDestination: Address;
  rewarder: Address;
  replicaRewarders?: Address[];
  amount: bigint;
}

export interface RescueTokensMergeMinerArgs {
  mmOwner: TransactionSigner;
  mergePool: Address;
  mm: Address;
  miner: Address;
  minerTokenAccount: Address;
  destinationTokenAccount: Address;
}

export interface CreateMergePoolArgs {
  primaryMint: Address;
  payer: TransactionSigner;
}

export interface MinerAddresses {
  rewarder: Address;
  quarry: Address;
  miner: Address;
  minerVault: Address;
}
