import { findMetadataPda } from "@macalinao/clients-token-metadata";
import type { Address } from "@solana/kit";
import type { PdasResult } from "./create-pdas-hook.js";
import { createPdasHook } from "./create-pdas-hook.js";

const TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as Address;

/**
 * Hook for computing multiple token metadata PDAs
 */
const useTokenMetadataPdasInternal = createPdasHook(
  async ({ mint }: { mint: Address }) => {
    const pda = await findMetadataPda({
      programId: TOKEN_METADATA_PROGRAM_ID,
      mint,
    });
    return pda;
  },
  "tokenMetadataPda",
);

/**
 * Hook for computing multiple token metadata PDAs
 *
 * This hook efficiently computes PDAs for multiple token metadata accounts in parallel.
 * The PDAs are cached indefinitely since they are deterministic based on the mint address.
 *
 * @param mints - Array of mint addresses to compute metadata PDAs for
 * @returns PdasResult containing loading state and array of PDAs
 *
 * @example
 * ```tsx
 * function TokenMetadataList({ mints }: { mints: Address[] }) {
 *   const { data: pdas, isLoading } = useTokenMetadataPdas({ mints });
 *
 *   if (isLoading) return <div>Computing PDAs...</div>;
 *
 *   return (
 *     <div>
 *       {pdas.map((pda, index) => (
 *         <div key={index}>
 *           Mint: {mints[index]}
 *           Metadata PDA: {pda}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Use with useAccounts to fetch the actual metadata
 * function TokenMetadataWithData({ mints }: { mints: Address[] }) {
 *   const { data: pdas } = useTokenMetadataPdas({ mints });
 *   const { data: metadataAccounts } = useAccounts({
 *     addresses: pdas,
 *     decoder: getMetadataDecoder(),
 *   });
 *
 *   return (
 *     <div>
 *       {metadataAccounts.map((account, index) => (
 *         <div key={index}>
 *           {account ? (
 *             <>
 *               Name: {account.data.data.name}
 *               Symbol: {account.data.data.symbol}
 *             </>
 *           ) : (
 *             "No metadata found"
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenMetadataPdas({
  mints,
}: {
  mints: (Address | null | undefined)[];
}): PdasResult<Address> {
  const pdaArgs = mints.map((mint) => (mint ? { mint } : null));
  return useTokenMetadataPdasInternal(pdaArgs);
}
