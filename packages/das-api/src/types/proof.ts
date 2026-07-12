import type { Address } from "@solana/kit";

/**
 * A merkle proof for a compressed asset, as returned by `getAssetProof`.
 */
export interface GetAssetProofResponse {
  /** The root of the merkle tree. */
  root: Address;
  /** The proof, as a list of node hashes. */
  proof: Address[];
  /** The index of the node within the tree. */
  node_index: number;
  /** The leaf hash of the asset. */
  leaf: Address;
  /** The address of the merkle tree. */
  tree_id: Address;
}

/**
 * A map of asset id to merkle proof, as returned by `getAssetProofBatch`.
 *
 * Entries may be `null` when a proof could not be found for the given id.
 */
export type GetAssetProofBatchResponse = Record<
  Address,
  GetAssetProofResponse | null
>;
