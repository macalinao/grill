import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findMetadataPda,
  getCreateMetadataAccountV3Instruction,
  TOKEN_METADATA_PROGRAM_ADDRESS,
} from "@macalinao/clients-token-metadata";
import { getCreateAccountInstruction } from "@solana-program/system";
import {
  getInitializeMint2Instruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getMinimumBalanceForRentExemption } from "gill";

/**
 * Creates a token with an optional freeze authority
 * @param mint - The mint signer
 * @param payer - The transaction signer who will pay for the account creation
 * @param freezeAuthority - Optional freeze authority for the token
 * @param decimals - The decimals for the mint
 * @param metadata - The metadata for the token
 * @returns Array of instructions to create the token
 */
export const createToken = async ({
  mint,
  payer,
  freezeAuthority,
  decimals,
  metadata,
}: {
  mint: TransactionSigner;
  payer: TransactionSigner;
  freezeAuthority?: Address;
  decimals: number;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  };
}): Promise<Instruction[]> => {
  const [metadataPda] = await findMetadataPda({
    mint: mint.address,
    programId: TOKEN_METADATA_PROGRAM_ADDRESS,
  });

  const mintSize = getMintSize();

  return [
    // Create mint account
    getCreateAccountInstruction({
      payer,
      newAccount: mint,
      lamports: getMinimumBalanceForRentExemption(mintSize),
      space: mintSize,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    }),
    // Initialize mint
    getInitializeMint2Instruction({
      mint: mint.address,
      mintAuthority: payer.address,
      freezeAuthority: freezeAuthority ?? null,
      decimals: decimals,
    }),
    // Create metadata
    getCreateMetadataAccountV3Instruction({
      metadata: metadataPda,
      mint: mint.address,
      mintAuthority: payer,
      payer,
      updateAuthority: payer,
      createMetadataAccountArgsV3: {
        data: {
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    }),
  ];
};
