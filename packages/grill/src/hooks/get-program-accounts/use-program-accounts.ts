import type { NamedDecoder } from "@macalinao/gill-extra";
import type { ReadonlyUint8Array } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Address } from "gill";
import type { GillUseRpcHook } from "../types.js";
import type { GetProgramAccountsQueryResult } from "./create-get-program-accounts-query.js";
import { useSolanaClient } from "@gillsdk/react";
import { useQuery } from "@tanstack/react-query";
import { createProgramAccountsQueryKey } from "../../query-keys.js";
import { createGetProgramAccountsQuery } from "./create-get-program-accounts-query.js";

export interface UseProgramAccountsInput<
  TDecodedData extends object = Uint8Array,
> extends GillUseRpcHook<Record<string, never>> {
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

/**
 * Hook for fetching all accounts owned by a program with optional filtering and decoding
 */
export function useProgramAccounts<TDecodedData extends object = Uint8Array>({
  options,
  programAddress,
  decoder,
  discriminator,
}: UseProgramAccountsInput<TDecodedData>): UseQueryResult<
  GetProgramAccountsQueryResult<TDecodedData>[]
> {
  const { rpc } = useSolanaClient();

  return useQuery({
    networkMode: "offlineFirst",
    ...options,
    queryKey: createProgramAccountsQueryKey(
      programAddress,
      discriminator,
      decoder.name,
    ),
    queryFn: createGetProgramAccountsQuery({
      rpc,
      programAddress,
      decoder,
      discriminator,
    }),
  }) as UseQueryResult<GetProgramAccountsQueryResult<TDecodedData>[]>;
}
