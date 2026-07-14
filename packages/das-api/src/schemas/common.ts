import type { Address } from "@solana/kit";
import type {
  DasApiAssetInterface,
  DasApiAuthorityScope,
  DasApiOwnershipModel,
  DasApiPropGroupKey,
  DasApiRoyaltyModel,
  DasApiUseMethod,
} from "../types/common.js";
import { addressSchema } from "@macalinao/zod-solana";
import * as z from "zod";

/**
 * Zod schema for a {@link DasApiAssetInterface}.
 */
export const dasApiAssetInterfaceSchema: z.ZodType<DasApiAssetInterface> =
  z.enum([
    "V1_NFT",
    "V1_PRINT",
    "LEGACY_NFT",
    "V2_NFT",
    "FungibleAsset",
    "FungibleToken",
    "Custom",
    "Identity",
    "Executable",
    "ProgrammableNFT",
    "MplCoreAsset",
    "MplCoreCollection",
  ]);

/**
 * Zod schema for a {@link DasApiAuthorityScope}.
 */
export const dasApiAuthorityScopeSchema: z.ZodType<DasApiAuthorityScope> =
  z.enum(["full", "royalty", "metadata", "extension"]);

/**
 * Zod schema for a {@link DasApiPropGroupKey}.
 */
export const dasApiPropGroupKeySchema: z.ZodType<DasApiPropGroupKey> = z.enum([
  "collection",
]);

/**
 * Zod schema for a {@link DasApiOwnershipModel}.
 */
export const dasApiOwnershipModelSchema: z.ZodType<DasApiOwnershipModel> =
  z.enum(["single", "token"]);

/**
 * Zod schema for a {@link DasApiRoyaltyModel}.
 */
export const dasApiRoyaltyModelSchema: z.ZodType<DasApiRoyaltyModel> = z.enum([
  "creators",
  "fanout",
  "single",
]);

/**
 * Zod schema for a {@link DasApiUseMethod}.
 */
export const dasApiUseMethodSchema: z.ZodType<DasApiUseMethod> = z.enum([
  "burn",
  "multiple",
  "single",
]);

/**
 * Zod schema for a base58 hash field on an asset's compression info
 * (`data_hash`, `creator_hash`, `asset_hash`, `tree`, ...).
 *
 * DAS indexers return an **empty string** for these fields on assets that are
 * not compressed, so an empty string is accepted and passed through unchanged.
 * Any other value must be a valid base58-encoded 32-byte hash. This keeps the
 * schema's output identical to the raw (unvalidated) response shape, at the cost
 * of `""` being typed as an `Address`.
 */
export const compressionHashSchema: z.ZodType<Address, string> = z.union([
  z.literal("").transform((value) => value as Address),
  addressSchema,
]);
