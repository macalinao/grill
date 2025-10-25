import type { Metadata } from "@macalinao/clients-token-metadata";
import type {
  PdaHook,
  PdasHook,
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Address } from "@solana/kit";
import type { UseAccountResult } from "./use-account.js";
import type { UseAccountsResult } from "./use-accounts.js";
import {
  findMetadataPda,
  getMetadataDecoder,
  TOKEN_METADATA_PROGRAM_ADDRESS,
} from "@macalinao/clients-token-metadata";
import { createDecodedAccountHook } from "./create-decoded-account-hook.js";
import { createDecodedAccountsHook } from "./create-decoded-accounts-hook.js";
import { createPdaHook } from "./create-pda-hook.js";
import { createPdasHook } from "./create-pdas-hook.js";

export const useTokenMetadataPda: PdaHook<{ mint: Address }> = createPdaHook(
  async ({ mint }: { mint: Address }) => {
    const pda = await findMetadataPda({
      programId: TOKEN_METADATA_PROGRAM_ADDRESS,
      mint,
    });
    return pda;
  },
  "tokenMetadataPda",
);

export const useTokenMetadataPdas: PdasHook<{ mint: Address }> = createPdasHook(
  async ({ mint }: { mint: Address }) => {
    const pda = await findMetadataPda({
      programId: TOKEN_METADATA_PROGRAM_ADDRESS,
      mint,
    });
    return pda;
  },
  "tokenMetadataPda",
);

export const useMplTokenMetadataAccount: UseDecodedAccountHook<Metadata> =
  createDecodedAccountHook(getMetadataDecoder());

export const useMplTokenMetadataAccounts: UseDecodedAccountsHook<Metadata> =
  createDecodedAccountsHook(getMetadataDecoder());

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
