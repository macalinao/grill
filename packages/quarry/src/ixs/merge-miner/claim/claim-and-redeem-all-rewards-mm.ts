import type { Rewarder } from "@macalinao/clients-quarry";
import type { AccountInfo } from "@macalinao/gill-extra";
import type { Instruction, TransactionSigner } from "@solana/kit";
import type { PoolInfo } from "../../../types.js";
import type { MergePoolAccount } from "../types.js";
import {
  findRedeemerPda,
  getRedeemAllTokensInstructionAsync,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCloseAccountInstruction,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { claimPrimaryRewards } from "./claim-primary-rewards.js";
import { claimReplicaRewards } from "./claim-replica-rewards.js";

/**
 * Claims and redeems all rewards (primary and secondary) for a merge miner.
 * This handles both claiming rewards and redeeming IOU tokens if applicable.
 */
export async function claimAndRedeemAllRewardsMM({
  poolInfo,
  mergePool,
  signer,
  primaryRewarder,
  secondaryRewarders,
}: {
  poolInfo: PoolInfo;
  mergePool: MergePoolAccount;
  signer: TransactionSigner;
  primaryRewarder: AccountInfo<
    Pick<Rewarder, "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount">
  >;
  secondaryRewarders?: (
    | AccountInfo<
        Pick<
          Rewarder,
          "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
        >
      >
    | undefined
  )[];
}): Promise<Instruction[]> {
  // Claim primary rewards
  const primaryIxs = await claimPrimaryRewards({
    mergePool,
    mmOwner: signer,
    rewarder: primaryRewarder,
  });

  // Prepare primary redemption instructions
  const primaryRedemptionIxs: Instruction[] = [];
  if (poolInfo.primaryRewards.iouMint) {
    const [primaryIouSource] = await findAssociatedTokenPda({
      mint: poolInfo.primaryRewards.iouMint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    const [primaryRedeemer] = await findRedeemerPda({
      iouMint: poolInfo.primaryRewards.iouMint,
      redemptionMint: poolInfo.primaryRewards.rewardsToken.mint,
    });

    const [primaryRedemptionVault] = await findAssociatedTokenPda({
      mint: poolInfo.primaryRewards.rewardsToken.mint,
      owner: primaryRedeemer,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    const [primaryRedemptionDestination] = await findAssociatedTokenPda({
      mint: poolInfo.primaryRewards.rewardsToken.mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    primaryRedemptionIxs.push(
      getCreateAssociatedTokenIdempotentInstruction({
        ata: primaryRedemptionDestination,
        mint: poolInfo.primaryRewards.rewardsToken.mint,
        owner: signer.address,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        payer: signer,
      }),
      await getRedeemAllTokensInstructionAsync({
        redeemer: primaryRedeemer,
        sourceAuthority: signer,
        iouMint: poolInfo.primaryRewards.iouMint,
        redemptionVault: primaryRedemptionVault,
        redemptionDestination: primaryRedemptionDestination,
      }),
      getCloseAccountInstruction({
        account: primaryIouSource,
        destination: signer.address,
        owner: signer,
      }),
    );
  }

  // Prepare secondary/replica rewards instructions
  const secondaryIxs: Instruction[] = [];
  if (poolInfo.secondaryRewards?.length && secondaryRewarders?.length) {
    for (let i = 0; i < poolInfo.secondaryRewards.length; i++) {
      const secondaryReward = poolInfo.secondaryRewards[i];
      const rewarderData = secondaryRewarders[i];

      if (!(secondaryReward && rewarderData)) {
        if (secondaryReward) {
          console.error(
            `Rewarder data for ${secondaryReward.rewarder} not found`,
          );
        }
        continue;
      }

      try {
        const replicaIxs = await claimReplicaRewards({
          mergePool,
          mmOwner: signer,
          rewarder: rewarderData,
        });
        secondaryIxs.push(...replicaIxs);

        if (secondaryReward.iouMint) {
          const [iouSource] = await findAssociatedTokenPda({
            mint: secondaryReward.iouMint,
            owner: signer.address,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
          });

          const [redeemer] = await findRedeemerPda({
            iouMint: secondaryReward.iouMint,
            redemptionMint: secondaryReward.rewardsToken.mint,
          });

          const [redemptionVault] = await findAssociatedTokenPda({
            mint: secondaryReward.rewardsToken.mint,
            owner: redeemer,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
          });

          const [redemptionDestination] = await findAssociatedTokenPda({
            mint: secondaryReward.rewardsToken.mint,
            owner: signer.address,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
          });

          secondaryIxs.push(
            getCreateAssociatedTokenIdempotentInstruction({
              ata: redemptionDestination,
              mint: secondaryReward.rewardsToken.mint,
              owner: signer.address,
              tokenProgram: TOKEN_PROGRAM_ADDRESS,
              payer: signer,
            }),
            await getRedeemAllTokensInstructionAsync({
              redeemer,
              sourceAuthority: signer,
              iouMint: secondaryReward.iouMint,
              redemptionVault,
              redemptionDestination,
            }),
            getCloseAccountInstruction({
              account: iouSource,
              destination: signer.address,
              owner: signer,
            }),
          );
        }
      } catch (error) {
        console.error(
          `Failed to generate claim instructions for ${secondaryReward.rewardsToken.symbol} rewards:`,
          error,
        );
      }
    }
  }

  return [...primaryIxs, ...primaryRedemptionIxs, ...secondaryIxs];
}
