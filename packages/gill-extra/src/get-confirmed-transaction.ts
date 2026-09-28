import type { GetTransactionApi, Rpc, Signature } from "@solana/kit";

/**
 * Gets a confirmed transaction from the blockchain with parsed JSON encoding
 * @param rpc - The RPC client with GetTransactionApi
 * @param signature - The transaction signature to fetch
 * @returns The transaction details or null if not found
 */
export const getConfirmedTransaction = async (
  rpc: Rpc<GetTransactionApi>,
  signature: Signature,
) => {
  return rpc
    .getTransaction(signature, {
      commitment: "confirmed",
      // 1 is the highest version kit understands; lower versions (legacy, 0)
      // are still returned as-is.
      maxSupportedTransactionVersion: 1,
      encoding: "jsonParsed",
    })
    .send();
};

/**
 * Type for a confirmed transaction fetched from the blockchain
 */
export type ConfirmedTransaction = NonNullable<
  Awaited<ReturnType<typeof getConfirmedTransaction>>
>;
