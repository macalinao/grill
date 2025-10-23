import type { Address, ReadonlyUint8Array } from "@solana/kit";

export const GRILL_REACT_QUERY_NAMESPACE = "solana" as const;

// Type definitions for query keys
export type AccountQueryKey = readonly ["solana", "account", Address];
export type TokenInfoQueryKey = readonly [
  "solana",
  "tokenInfo",
  Address | null | undefined,
];
export type PdaQueryKey<TArgs> = readonly [
  "solana",
  "pda",
  string,
  TArgs | null | undefined,
];
export type ProgramAccountsQueryKey = readonly [
  "solana",
  "programAccounts",
  {
    programAddress: Address;
    discriminator: ReadonlyUint8Array;
    decoderName: string;
  },
];

/**
 * Create a query key for the account query
 * @param address - The address of the account
 * @returns The query key
 */
export const createAccountQueryKey = (address: Address): AccountQueryKey =>
  [GRILL_REACT_QUERY_NAMESPACE, "account", address] as const;

/**
 * Create a query key for token info query
 * @param mint - The mint address
 * @returns The query key
 */
export const createTokenInfoQueryKey = (
  mint: Address | null | undefined,
): TokenInfoQueryKey =>
  [GRILL_REACT_QUERY_NAMESPACE, "tokenInfo", mint] as const;

/**
 * Create a query key for PDA queries
 * @param queryKeyPrefix - The PDA type prefix
 * @param args - The arguments for the PDA
 * @returns The query key
 */
export const createPdaQueryKey = <TArgs>(
  queryKeyPrefix: string,
  args: TArgs | null | undefined,
): PdaQueryKey<TArgs> =>
  [GRILL_REACT_QUERY_NAMESPACE, "pda", queryKeyPrefix, args] as const;

/**
 * Create a query key for program accounts queries
 * @param programAddress - The program address
 * @param discriminator - The discriminator for filtering
 * @param decoderName - The name of the decoder
 * @returns The query key
 */
export const createProgramAccountsQueryKey = (
  programAddress: Address,
  discriminator: ReadonlyUint8Array,
  decoderName: string,
): ProgramAccountsQueryKey =>
  [
    GRILL_REACT_QUERY_NAMESPACE,
    "programAccounts",
    {
      programAddress,
      discriminator,
      decoderName,
    },
  ] as const;
