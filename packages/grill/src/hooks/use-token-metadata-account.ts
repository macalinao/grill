import type { Metadata } from "@macalinao/clients-token-metadata";
import {
  findMetadataPda,
  getMetadataDecoder,
} from "@macalinao/clients-token-metadata";
import type { Account, Address } from "@solana/kit";
import type { UseQueryResult } from "@tanstack/react-query";
import { createPdaHook } from "./create-pda-hook.js";
import { useAccount } from "./use-account.js";

const TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as Address;

const useMetadataPda = createPdaHook(async ({ mint }: { mint: Address }) => {
  const pda = await findMetadataPda({
    programId: TOKEN_METADATA_PROGRAM_ID,
    mint,
  });
  return pda;
}, "tokenMetadataPda");

export function useTokenMetadataAccount({
  mint,
}: {
  mint: Address | null | undefined;
}): UseQueryResult<Account<Metadata> | null> & {
  pda: Address | null | undefined;
  address: Address | null | undefined;
} {
  const pda = useMetadataPda(mint ? { mint } : null);

  const accountResult = useAccount({
    address: pda,
    decoder: getMetadataDecoder(),
  });

  return {
    ...accountResult,
    pda,
    address: pda,
  };
}
