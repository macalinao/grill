import * as z from "zod";

/**
 * Schema for token metadata attributes
 */
const tokenAttributeSchema: z.ZodType<TokenMetadataAttribute> = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
  display_type: z.string().optional(),
});

/**
 * Schema for token metadata files
 */
const tokenFileSchema: z.ZodType<TokenMetadataFile> = z.object({
  uri: z.string(),
  type: z.string(),
  cdn: z.boolean().optional(),
});

/**
 * Schema for token metadata creators
 */
const tokenCreatorSchema: z.ZodType<TokenMetadataCreator> = z.object({
  address: z.string(),
  share: z.number().min(0).max(100),
});

/**
 * Schema for token metadata properties
 */
const tokenPropertiesSchema: z.ZodType<TokenMetadataProperties> = z.object({
  files: z.array(tokenFileSchema).optional(),
  category: z.string().optional(),
  creators: z.array(tokenCreatorSchema).optional(),
});

/**
 * Schema for token metadata collection
 */
const tokenCollectionSchema: z.ZodType<TokenMetadataCollection> = z.object({
  name: z.string(),
  family: z.string().optional(),
});

/**
 * Interface for token metadata attributes/traits
 */
export interface TokenMetadataAttribute {
  /** The trait type/category */
  trait_type: string;
  /** The trait value (string or number) */
  value: string | number;
  /** Optional display type for UI formatting */
  display_type?: string;
}

/**
 * Interface for token metadata file references
 */
export interface TokenMetadataFile {
  /** File URI */
  uri: string;
  /** File MIME type */
  type: string;
  /** Whether the file is CDN cached */
  cdn?: boolean;
}

/**
 * Interface for token creator information with royalty shares
 */
export interface TokenMetadataCreator {
  /** Creator's wallet address */
  address: string;
  /** Creator's royalty share percentage (0-100) */
  share: number;
}

/**
 * Interface for token metadata properties
 */
export interface TokenMetadataProperties {
  /** Optional array of file references */
  files?: TokenMetadataFile[];
  /** Optional category classification */
  category?: string;
  /** Optional array of creators with royalty shares */
  creators?: TokenMetadataCreator[];
}

/**
 * Interface for token collection information
 */
export interface TokenMetadataCollection {
  /** Collection name */
  name: string;
  /** Optional collection family */
  family?: string;
}

/**
 * Interface for Solana token metadata following the Metaplex Token Metadata Standard
 */
export interface TokenMetadata {
  /** The name of the token */
  name: string;
  /** The symbol of the token */
  symbol: string;
  /** Optional description of the token */
  description?: string;
  /** Optional image URI */
  image?: string;
  /** Optional animation URL for multimedia content */
  animation_url?: string;
  /** Optional external URL for additional information */
  external_url?: string;
  /** Optional array of attributes/traits */
  attributes?: TokenMetadataAttribute[];
  /** Optional properties object */
  properties?: TokenMetadataProperties;
  /** Optional seller fee basis points (royalty percentage * 100) */
  seller_fee_basis_points?: number;
  /** Optional collection information */
  collection?: TokenMetadataCollection;
}

/**
 * Schema for Solana token metadata JSON
 * Based on Metaplex Token Metadata Standard
 */
export const tokenMetadataSchema: z.ZodType<TokenMetadata> = z.object({
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
  collection: tokenCollectionSchema.optional(),
});
