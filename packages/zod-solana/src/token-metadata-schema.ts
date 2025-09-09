import * as z from "zod";

/**
 * Schema for token metadata attributes
 */
const tokenAttributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
  display_type: z.string().optional(),
});

/**
 * Schema for token metadata files
 */
const tokenFileSchema = z.object({
  uri: z.string(),
  type: z.string(),
  cdn: z.boolean().optional(),
});

/**
 * Schema for token metadata properties
 */
const tokenPropertiesSchema = z.object({
  files: z.array(tokenFileSchema).optional(),
  category: z.string().optional(),
  creators: z
    .array(
      z.object({
        address: z.string(),
        share: z.number().min(0).max(100),
      }),
    )
    .optional(),
});

/**
 * Schema for Solana token metadata JSON
 * Based on Metaplex Token Metadata Standard
 */
export const tokenMetadataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  animation_url: z.string().optional(),
  external_url: z.string().optional(),
  attributes: z.array(tokenAttributeSchema).optional(),
  properties: tokenPropertiesSchema.optional(),
  // Additional fields that may be present
  seller_fee_basis_points: z.number().optional(),
  collection: z
    .object({
      name: z.string(),
      family: z.string().optional(),
    })
    .optional(),
});

export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;
