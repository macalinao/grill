import type {
  DasApiAsset,
  DasApiAssetAuthority,
  DasApiAssetCompression,
  DasApiAssetContent,
  DasApiAssetCreator,
  DasApiAssetFile,
  DasApiAssetGrouping,
  DasApiAssetLinks,
  DasApiAssetOwnership,
  DasApiAssetRoyalty,
  DasApiAssetSupply,
  DasApiCollectionMetadata,
  DasApiDefaultAccountState,
  DasApiGroupPointer,
  DasApiInscription,
  DasApiInterestBearingConfig,
  DasApiMetadata,
  DasApiMetadataAttribute,
  DasApiMetadataPointer,
  DasApiMintCloseAuthority,
  DasApiMintExtensions,
  DasApiPermanentDelegate,
  DasApiPriceInfo,
  DasApiTokenInfo,
  DasApiTokenMetadataExtension,
  DasApiTransferFee,
  DasApiTransferFeeConfig,
  DasApiTransferHook,
  DasApiUses,
} from "../types/asset.js";
import { addressSchema } from "@macalinao/zod-solana";
import * as z from "zod";
import {
  compressionHashSchema,
  dasApiAssetInterfaceSchema,
  dasApiAuthorityScopeSchema,
  dasApiOwnershipModelSchema,
  dasApiPropGroupKeySchema,
  dasApiRoyaltyModelSchema,
  dasApiUseMethodSchema,
} from "./common.js";
import { jsonValueSchema } from "./json-value.js";

/**
 * Zod schema for a {@link DasApiAssetFile}.
 */
export const dasApiAssetFileSchema: z.ZodType<DasApiAssetFile> = z.looseObject({
  uri: z.string().optional(),
  mime: z.string().optional(),
  cdn_uri: z.string().optional(),
  contexts: z.array(z.string()).optional(),
});

/**
 * Zod schema for a {@link DasApiMetadataAttribute}.
 */
export const dasApiMetadataAttributeSchema: z.ZodType<DasApiMetadataAttribute> =
  z.looseObject({
    trait_type: z.string().optional(),
    value: z.union([z.string(), z.number()]).optional(),
    display_type: z.string().optional(),
  });

/**
 * Zod schema for a {@link DasApiMetadata}.
 */
export const dasApiMetadataSchema: z.ZodType<DasApiMetadata> = z.looseObject({
  name: z.string(),
  symbol: z.string(),
  description: z.string().optional(),
  token_standard: z.string().optional(),
  attributes: z.array(dasApiMetadataAttributeSchema).optional(),
});

/**
 * Zod schema for a {@link DasApiAssetLinks}.
 */
export const dasApiAssetLinksSchema: z.ZodType<DasApiAssetLinks> =
  z.looseObject({
    image: z.string().optional(),
    animation_url: z.string().optional(),
    external_url: z.string().optional(),
  });

/**
 * Zod schema for a {@link DasApiAssetContent}.
 */
export const dasApiAssetContentSchema: z.ZodType<DasApiAssetContent> =
  z.looseObject({
    $schema: z.string().optional(),
    json_uri: z.string(),
    files: z.array(dasApiAssetFileSchema).optional(),
    metadata: dasApiMetadataSchema,
    links: dasApiAssetLinksSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiAssetAuthority}.
 */
export const dasApiAssetAuthoritySchema: z.ZodType<DasApiAssetAuthority> =
  z.looseObject({
    address: addressSchema,
    scopes: z.array(dasApiAuthorityScopeSchema),
  });

/**
 * Zod schema for a {@link DasApiAssetCompression}.
 *
 * The hash fields are validated with {@link compressionHashSchema}, which also
 * accepts the empty strings that indexers return for uncompressed assets.
 */
export const dasApiAssetCompressionSchema: z.ZodType<DasApiAssetCompression> =
  z.looseObject({
    eligible: z.boolean(),
    compressed: z.boolean(),
    data_hash: compressionHashSchema,
    creator_hash: compressionHashSchema,
    collection_hash: compressionHashSchema.optional(),
    asset_data_hash: compressionHashSchema.optional(),
    flags: z.number().optional(),
    asset_hash: compressionHashSchema,
    tree: compressionHashSchema,
    seq: z.number(),
    leaf_id: z.number(),
  });

/**
 * Zod schema for a {@link DasApiCollectionMetadata}.
 */
export const dasApiCollectionMetadataSchema: z.ZodType<DasApiCollectionMetadata> =
  z.looseObject({
    name: z.string().optional(),
    symbol: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    external_url: z.string().optional(),
  });

/**
 * Zod schema for a {@link DasApiAssetGrouping}.
 */
export const dasApiAssetGroupingSchema: z.ZodType<DasApiAssetGrouping> =
  z.looseObject({
    group_key: dasApiPropGroupKeySchema,
    group_value: z.string(),
    verified: z.boolean().optional(),
    collection_metadata: dasApiCollectionMetadataSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiAssetRoyalty}.
 */
export const dasApiAssetRoyaltySchema: z.ZodType<DasApiAssetRoyalty> =
  z.looseObject({
    royalty_model: dasApiRoyaltyModelSchema,
    target: addressSchema.nullable(),
    percent: z.number(),
    basis_points: z.number(),
    primary_sale_happened: z.boolean(),
    locked: z.boolean(),
  });

/**
 * Zod schema for a {@link DasApiAssetCreator}.
 */
export const dasApiAssetCreatorSchema: z.ZodType<DasApiAssetCreator> =
  z.looseObject({
    address: addressSchema,
    share: z.number(),
    verified: z.boolean(),
  });

/**
 * Zod schema for a {@link DasApiAssetOwnership}.
 */
export const dasApiAssetOwnershipSchema: z.ZodType<DasApiAssetOwnership> =
  z.looseObject({
    frozen: z.boolean(),
    non_transferable: z.boolean().optional(),
    delegated: z.boolean(),
    delegate: addressSchema.nullable(),
    ownership_model: dasApiOwnershipModelSchema,
    owner: addressSchema,
  });

/**
 * Zod schema for a {@link DasApiAssetSupply}.
 */
export const dasApiAssetSupplySchema: z.ZodType<DasApiAssetSupply> =
  z.looseObject({
    print_max_supply: z.number().optional(),
    print_current_supply: z.number().optional(),
    edition_nonce: z.number().nullish(),
    master_edition_mint: addressSchema.optional(),
    edition_number: z.number().optional(),
  });

/**
 * Zod schema for a {@link DasApiUses}.
 */
export const dasApiUsesSchema: z.ZodType<DasApiUses> = z.looseObject({
  use_method: dasApiUseMethodSchema,
  remaining: z.number(),
  total: z.number(),
});

/**
 * Zod schema for a {@link DasApiPriceInfo}.
 */
export const dasApiPriceInfoSchema: z.ZodType<DasApiPriceInfo> = z.looseObject({
  price_per_token: z.number(),
  total_price: z.number().optional(),
  currency: z.string().optional(),
});

/**
 * Zod schema for a {@link DasApiTokenInfo}.
 */
export const dasApiTokenInfoSchema: z.ZodType<DasApiTokenInfo> = z.looseObject({
  symbol: z.string().optional(),
  balance: z.number().optional(),
  supply: z.number().optional(),
  decimals: z.number().optional(),
  token_program: addressSchema.optional(),
  associated_token_address: addressSchema.optional(),
  price_info: dasApiPriceInfoSchema.optional(),
  mint_authority: addressSchema.optional(),
  freeze_authority: addressSchema.optional(),
});

/**
 * Zod schema for a {@link DasApiInscription}.
 */
export const dasApiInscriptionSchema: z.ZodType<DasApiInscription> =
  z.looseObject({
    order: z.number().optional(),
    size: z.number().optional(),
    contentType: z.string().optional(),
    encoding: z.string().optional(),
    validationHash: z.string().optional(),
    inscriptionDataAccount: addressSchema.optional(),
    authority: addressSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiTransferFee}.
 */
export const dasApiTransferFeeSchema: z.ZodType<DasApiTransferFee> =
  z.looseObject({
    epoch: z.number(),
    maximum_fee: z.number(),
    transfer_fee_basis_points: z.number(),
  });

/**
 * Zod schema for a {@link DasApiTransferFeeConfig}.
 */
export const dasApiTransferFeeConfigSchema: z.ZodType<DasApiTransferFeeConfig> =
  z.looseObject({
    transfer_fee_config_authority: addressSchema.optional(),
    withdraw_withheld_authority: addressSchema.optional(),
    withheld_amount: z.number().optional(),
    older_transfer_fee: dasApiTransferFeeSchema.optional(),
    newer_transfer_fee: dasApiTransferFeeSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiTransferHook}.
 */
export const dasApiTransferHookSchema: z.ZodType<DasApiTransferHook> =
  z.looseObject({
    authority: addressSchema.optional(),
    program_id: addressSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiMetadataPointer}.
 */
export const dasApiMetadataPointerSchema: z.ZodType<DasApiMetadataPointer> =
  z.looseObject({
    authority: addressSchema.optional(),
    metadata_address: addressSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiGroupPointer}.
 */
export const dasApiGroupPointerSchema: z.ZodType<DasApiGroupPointer> =
  z.looseObject({
    authority: addressSchema.optional(),
    group_address: addressSchema.optional(),
    member_address: addressSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiMintCloseAuthority}.
 */
export const dasApiMintCloseAuthoritySchema: z.ZodType<DasApiMintCloseAuthority> =
  z.looseObject({
    close_authority: addressSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiPermanentDelegate}.
 */
export const dasApiPermanentDelegateSchema: z.ZodType<DasApiPermanentDelegate> =
  z.looseObject({
    delegate: addressSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiDefaultAccountState}.
 */
export const dasApiDefaultAccountStateSchema: z.ZodType<DasApiDefaultAccountState> =
  z.looseObject({
    state: z.string().optional(),
  });

/**
 * Zod schema for a {@link DasApiInterestBearingConfig}.
 */
export const dasApiInterestBearingConfigSchema: z.ZodType<DasApiInterestBearingConfig> =
  z.looseObject({
    rate_authority: addressSchema.optional(),
    initialization_timestamp: z.number().optional(),
    pre_update_average_rate: z.number().optional(),
    last_update_timestamp: z.number().optional(),
    current_rate: z.number().optional(),
  });

/**
 * Zod schema for a {@link DasApiTokenMetadataExtension}.
 */
export const dasApiTokenMetadataExtensionSchema: z.ZodType<DasApiTokenMetadataExtension> =
  z.looseObject({
    update_authority: addressSchema.optional(),
    mint: addressSchema.optional(),
    name: z.string().optional(),
    symbol: z.string().optional(),
    uri: z.string().optional(),
    additional_metadata: z.array(z.tuple([z.string(), z.string()])).optional(),
  });

/**
 * Zod schema for {@link DasApiMintExtensions}.
 *
 * Extensions that are not typed explicitly are validated as {@link JsonValue}.
 */
export const dasApiMintExtensionsSchema: z.ZodType<DasApiMintExtensions> =
  z.looseObject({
    confidential_transfer_account: jsonValueSchema.optional(),
    confidential_transfer_mint: jsonValueSchema.optional(),
    confidential_transfer_fee_config: jsonValueSchema.optional(),
    default_account_state: dasApiDefaultAccountStateSchema.optional(),
    group_member_pointer: dasApiGroupPointerSchema.optional(),
    group_pointer: dasApiGroupPointerSchema.optional(),
    interest_bearing_config: dasApiInterestBearingConfigSchema.optional(),
    metadata: dasApiTokenMetadataExtensionSchema.optional(),
    metadata_pointer: dasApiMetadataPointerSchema.optional(),
    mint_close_authority: dasApiMintCloseAuthoritySchema.optional(),
    permanent_delegate: dasApiPermanentDelegateSchema.optional(),
    token_group: jsonValueSchema.optional(),
    token_group_member: jsonValueSchema.optional(),
    transfer_fee_config: dasApiTransferFeeConfigSchema.optional(),
    transfer_hook: dasApiTransferHookSchema.optional(),
  });

/**
 * Zod schema for a {@link DasApiAsset}.
 *
 * Unknown keys are preserved (the schema is built from loose objects) so that
 * provider-specific fields survive a `parse` even though they are not typed.
 */
export const dasApiAssetSchema: z.ZodType<DasApiAsset> = z.looseObject({
  interface: dasApiAssetInterfaceSchema,
  id: addressSchema,
  content: dasApiAssetContentSchema,
  authorities: z.array(dasApiAssetAuthoritySchema),
  compression: dasApiAssetCompressionSchema,
  grouping: z.array(dasApiAssetGroupingSchema),
  royalty: dasApiAssetRoyaltySchema,
  creators: z.array(dasApiAssetCreatorSchema),
  ownership: dasApiAssetOwnershipSchema,
  uses: dasApiUsesSchema.optional(),
  supply: dasApiAssetSupplySchema.nullish(),
  mutable: z.boolean(),
  burnt: z.boolean(),
  token_info: dasApiTokenInfoSchema.optional(),
  mint_extensions: dasApiMintExtensionsSchema.optional(),
  inscription: dasApiInscriptionSchema.optional(),
  spl20: z.record(z.string(), jsonValueSchema).optional(),
  last_indexed_slot: z.number().optional(),
  // Core asset fields (present when the interface is an MPL Core interface).
  plugins: z.record(z.string(), jsonValueSchema).optional(),
  external_plugins: z.array(jsonValueSchema).optional(),
  unknown_plugins: z.array(jsonValueSchema).optional(),
  unknown_external_plugins: z.array(jsonValueSchema).optional(),
  mpl_core_info: z
    .looseObject({
      num_minted: z.number().optional(),
      current_size: z.number().optional(),
      plugins_json_version: z.number().optional(),
    })
    .optional(),
});
