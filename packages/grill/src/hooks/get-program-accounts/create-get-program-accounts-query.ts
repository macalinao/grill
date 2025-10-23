import type { NamedDecoder } from "@macalinao/gill-extra";
import type { Base64EncodedBytes, ReadonlyUint8Array } from "@solana/kit";
import type { Address, SolanaClient } from "gill";
import { getBase64Encoder } from "@solana/kit";

export interface GetProgramAccountsQueryParams<TDecodedData extends object> {
  /**
   * The RPC client to use for fetching program accounts
   */
  rpc: SolanaClient["rpc"];
  /**
   * The program address to query accounts for
   */
  programAddress: Address;
  /**
   * Named decoder to decode the account data
   */
  decoder: NamedDecoder<TDecodedData>;
  /**
   * Discriminator to filter accounts by
   */
  discriminator: ReadonlyUint8Array;
}

export interface GetProgramAccountsQueryResult<TDecodedData extends object> {
  /**
   * The account address
   */
  address: Address;
  /**
   * The account data - raw encoded account from RPC
   */
  account: unknown;
  /**
   * The named decoder used for this account type
   */
  decoder: NamedDecoder<TDecodedData>;
}

/**
 * Creates a query function for fetching program accounts with optional filtering and decoding
 */
export function createGetProgramAccountsQuery<TDecodedData extends object>({
  rpc,
  programAddress,
  decoder,
  discriminator,
}: GetProgramAccountsQueryParams<TDecodedData>) {
  return async (): Promise<GetProgramAccountsQueryResult<TDecodedData>[]> => {
    const filters = [
      {
        memcmp: {
          offset: 0n,
          encoding: "base64" as const,
          bytes: getBase64Encoder().encode(
            new TextDecoder().decode(discriminator),
          ) as unknown as Base64EncodedBytes,
        },
      },
    ];

    const response = await rpc
      .getProgramAccounts(programAddress, {
        encoding: "base64",
        filters,
      })
      .send();

    return response.map(
      ({ account, pubkey }: { account: unknown; pubkey: Address }) => ({
        address: pubkey,
        account,
        decoder,
      }),
    );
  };
}
