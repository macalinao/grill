import type { Metadata } from "@macalinao/clients-token-metadata";
import type { Address } from "@solana/kit";
import type { UseAccountResult } from "./use-account.js";
import type { UseAccountsResult } from "./use-accounts.js";
import {
  findMetadataPda,
  getMetadataDecoder,
} from "@macalinao/clients-token-metadata";
import { createDecodedAccountHook } from "./create-decoded-account-hook.js";
import { createDecodedAccountsHook } from "./create-decoded-accounts-hook.js";
import { createPdaHook } from "./create-pda-hook.js";
import { createPdasHook } from "./create-pdas-hook.js";

const TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as Address;

export const useTokenMetadataPda = createPdaHook(
  async ({ mint }: { mint: Address }) => {
    const pda = await findMetadataPda({
      programId: TOKEN_METADATA_PROGRAM_ID,
      mint,
    });
    return pda;
  },
  "tokenMetadataPda",
);

export const useTokenMetadataPdas = createPdasHook(
  async ({ mint }: { mint: Address }) => {
    const pda = await findMetadataPda({
      programId: TOKEN_METADATA_PROGRAM_ID,
      mint,
    });
    return pda;
  },
  "tokenMetadataPda",
);

export const useMplTokenMetadataAccount = createDecodedAccountHook(
  getMetadataDecoder(),
);

export const useMplTokenMetadataAccounts = createDecodedAccountsHook(
  getMetadataDecoder(),
);

export function useTokenMetadataAccount({
  mint,
}: {
  mint: Address | null | undefined;
}): UseAccountResult<Metadata> {
  const pda = useTokenMetadataPda(mint ? { mint } : null);
  return useMplTokenMetadataAccount({
    address: pda,
  });
}

export function useTokenMetadataAccounts({
  mints,
}: {
  mints: Address[] | null | undefined;
}): UseAccountsResult<Metadata> {
  const pdas = useTokenMetadataPdas(
    mints ? mints.map((mint) => ({ mint })) : mints,
  );
  return useMplTokenMetadataAccounts({
    addresses: pdas ?? [],
  });
}
