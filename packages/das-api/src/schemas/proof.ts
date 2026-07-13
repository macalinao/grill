import type {
  GetAssetProofBatchResponse,
  GetAssetProofResponse,
} from "../types/proof.js";
import { addressSchema } from "@macalinao/zod-solana";
import * as z from "zod";

/**
 * Zod schema for a {@link GetAssetProofResponse}.
 */
export const getAssetProofResponseSchema: z.ZodType<GetAssetProofResponse> =
  z.looseObject({
    root: addressSchema,
    proof: z.array(addressSchema),
    node_index: z.number(),
    leaf: addressSchema,
    tree_id: addressSchema,
  });

/**
 * Zod schema for a {@link GetAssetProofBatchResponse}.
 *
 * Values may be `null` when the indexer has no proof for the requested id.
 */
export const getAssetProofBatchResponseSchema: z.ZodType<GetAssetProofBatchResponse> =
  z.record(addressSchema, getAssetProofResponseSchema.nullable());
