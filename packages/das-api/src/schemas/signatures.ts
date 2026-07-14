import type {
  DasApiAssetSignature,
  GetSignaturesForAssetResponse,
} from "../types/signatures.js";
import * as z from "zod";

/**
 * Zod schema for a {@link DasApiAssetSignature}, the `[signature, type]` tuple
 * the DAS API returns for each transaction touching an asset.
 */
export const dasApiAssetSignatureSchema: z.ZodType<DasApiAssetSignature> =
  z.tuple([z.string(), z.string()]);

/**
 * Zod schema for a {@link GetSignaturesForAssetResponse}.
 */
export const getSignaturesForAssetResponseSchema: z.ZodType<GetSignaturesForAssetResponse> =
  z.looseObject({
    total: z.number(),
    limit: z.number(),
    page: z.number().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    id: z.string().optional(),
    items: z.array(dasApiAssetSignatureSchema),
  });
