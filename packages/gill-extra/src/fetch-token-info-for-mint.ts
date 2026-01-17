import type { Metadata } from "@macalinao/clients-token-metadata";
import type { RpcWithGetMultipleAccounts } from "@macalinao/solana-batch-accounts-loader";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import type { FetchTokenInfoParams } from "./fetch-token-info.js";
import {
  findMetadataPda,
  getMetadataDecoder,
  TOKEN_METADATA_PROGRAM_ADDRESS,
} from "@macalinao/clients-token-metadata";
import { getMintDecoder } from "@solana-program/token";
import { decodeAccount, fetchEncodedAccounts } from "gill";
import { fetchTokenInfo } from "./fetch-token-info.js";

export interface FetchTokenInfoForMintParams
  extends Omit<FetchTokenInfoParams, "mint" | "metadata"> {
  /**
   * The RPC client to use for fetching accounts.
   */
  rpc: RpcWithGetMultipleAccounts;
  /**
   * The mint address to fetch token info for.
   */
  mint: Address;
}

/**
 * Fetches TokenInfo for a given mint address by fetching the mint and metadata accounts.
 * Uses a single getMultipleAccounts call to fetch both accounts in parallel.
 *
 * @param params - Object containing rpc, mint address, and optional fetchFromCertifiedTokenList
 * @returns TokenInfo for the mint
 */
export async function fetchTokenInfoForMint({
  rpc,
  mint,
  fetchFromCertifiedTokenList,
}: FetchTokenInfoForMintParams): Promise<TokenInfo> {
  // Find the metadata PDA
  const [metadataPda] = await findMetadataPda({
    mint,
    programId: TOKEN_METADATA_PROGRAM_ADDRESS,
  });

  // Fetch both accounts in parallel using getMultipleAccounts
  const accounts = await fetchEncodedAccounts(rpc, [mint, metadataPda]);
  const mintAccountEncoded = accounts[0];
  const metadataAccountEncoded = accounts[1];

  // Decode the mint account (required)
  if (!mintAccountEncoded?.exists) {
    throw new Error(`Mint account not found: ${mint}`);
  }
  const mintDecoder = getMintDecoder();
  const mintAccount = decodeAccount(mintAccountEncoded, mintDecoder);

  // Decode the metadata account (optional)
  let metadata: Metadata | null = null;
  if (metadataAccountEncoded?.exists) {
    const metadataDecoder = getMetadataDecoder();
    const metadataAccount = decodeAccount(
      metadataAccountEncoded,
      metadataDecoder,
    );
    metadata = metadataAccount.data;
  }

  return fetchTokenInfo({
    mint: mintAccount,
    metadata,
    fetchFromCertifiedTokenList,
  });
}
