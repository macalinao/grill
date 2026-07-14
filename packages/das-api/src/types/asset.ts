import type { Address } from "@solana/kit";
import type {
  DasApiAssetInterface,
  DasApiAuthorityScope,
  DasApiOwnershipModel,
  DasApiPropGroupKey,
  DasApiRoyaltyModel,
  DasApiUseMethod,
} from "./common.js";
import type { JsonValue } from "./json-value.js";

/**
 * A file referenced by an asset's off-chain metadata.
 *
 * These interfaces describe the fields the DAS indexer surfaces. To read
 * additional provider-specific fields, extend the interface via declaration
 * merging.
 */
export interface DasApiAssetFile {
  /** The URI of the file. */
  uri?: string;
  /** The MIME type of the file. */
  mime?: string;
  /** The CDN-hosted URI of the file, if available. */
  cdn_uri?: string;
  /** The rendering contexts the file applies to. */
  contexts?: string[];
}

/**
 * An attribute/trait of an asset.
 */
export interface DasApiMetadataAttribute {
  /** The trait type/category. */
  trait_type?: string;
  /** The trait value. */
  value?: string | number;
  /** A hint for how the value should be displayed. */
  display_type?: string;
}

/**
 * Off-chain metadata for an asset, as indexed by the DAS provider.
 */
export interface DasApiMetadata {
  /** The name of the asset. */
  name: string;
  /** The symbol of the asset. */
  symbol: string;
  /** A description of the asset. */
  description?: string;
  /** The Metaplex token standard, if applicable. */
  token_standard?: string;
  /** The attributes/traits of the asset. */
  attributes?: DasApiMetadataAttribute[];
}

/**
 * Convenience links extracted from an asset's off-chain metadata.
 */
export interface DasApiAssetLinks {
  /** The image URI. */
  image?: string;
  /** The animation URI. */
  animation_url?: string;
  /** The external URI. */
  external_url?: string;
}

/**
 * The content of an asset: its metadata URI, files, links and metadata.
 */
export interface DasApiAssetContent {
  /** The JSON schema of the content. */
  $schema?: string;
  /** The URI of the off-chain JSON metadata. */
  json_uri: string;
  /** The files referenced by the asset. */
  files?: DasApiAssetFile[];
  /** The parsed off-chain metadata. */
  metadata: DasApiMetadata;
  /** Convenience links extracted from the metadata (e.g. image, animation). */
  links?: DasApiAssetLinks;
}

/**
 * An on-chain authority that has some scope of control over an asset.
 */
export interface DasApiAssetAuthority {
  /** The address of the authority. */
  address: Address;
  /** The scopes the authority has over the asset. */
  scopes: DasApiAuthorityScope[];
}

/**
 * Compression information for an asset (relevant for compressed NFTs).
 */
export interface DasApiAssetCompression {
  /** Whether the asset is eligible for compression. */
  eligible: boolean;
  /** Whether the asset is currently compressed. */
  compressed: boolean;
  /** The data hash of the asset. */
  data_hash: Address;
  /** The creator hash of the asset. */
  creator_hash: Address;
  /** The collection hash of the asset. */
  collection_hash?: Address;
  /** The asset data hash. */
  asset_data_hash?: Address;
  /** Bitflags describing the compressed asset. */
  flags?: number;
  /** The asset hash. */
  asset_hash: Address;
  /** The address of the merkle tree the asset belongs to. */
  tree: Address;
  /** The sequence number of the asset within the tree. */
  seq: number;
  /** The index of the leaf within the tree. */
  leaf_id: number;
}

/**
 * Collection metadata, present when `showCollectionMetadata` is enabled.
 */
export interface DasApiCollectionMetadata {
  /** The name of the collection. */
  name?: string;
  /** The symbol of the collection. */
  symbol?: string;
  /** The description of the collection. */
  description?: string;
  /** The image URI of the collection. */
  image?: string;
  /** The external URI of the collection. */
  external_url?: string;
}

/**
 * Grouping information for an asset (e.g. which collection it belongs to).
 */
export interface DasApiAssetGrouping {
  /** The key of the group. */
  group_key: DasApiPropGroupKey;
  /** The value of the group (e.g. the collection address). */
  group_value: string;
  /** Whether the group membership is verified. */
  verified?: boolean;
  /** Collection metadata, present when `showCollectionMetadata` is enabled. */
  collection_metadata?: DasApiCollectionMetadata;
}

/**
 * Royalty information for an asset.
 */
export interface DasApiAssetRoyalty {
  /** The royalty model of the asset. */
  royalty_model: DasApiRoyaltyModel;
  /** The target address for royalties, if any. */
  target: Address | null;
  /** The royalty percentage, expressed as a fraction (e.g. 0.05 for 5%). */
  percent: number;
  /** The royalty amount in basis points. */
  basis_points: number;
  /** Whether the primary sale has happened. */
  primary_sale_happened: boolean;
  /** Whether the royalty configuration is locked. */
  locked: boolean;
}

/**
 * A creator of an asset.
 */
export interface DasApiAssetCreator {
  /** The address of the creator. */
  address: Address;
  /** The creator's royalty share (0-100). */
  share: number;
  /** Whether the creator is verified. */
  verified: boolean;
}

/**
 * Ownership information for an asset.
 */
export interface DasApiAssetOwnership {
  /** Whether the asset is frozen. */
  frozen: boolean;
  /** Whether the asset is non-transferable. */
  non_transferable?: boolean;
  /** Whether the asset is delegated. */
  delegated: boolean;
  /** The delegate address, if the asset is delegated. */
  delegate: Address | null;
  /** The ownership model of the asset. */
  ownership_model: DasApiOwnershipModel;
  /** The owner of the asset. */
  owner: Address;
}

/**
 * Supply information for an asset (relevant for editions).
 */
export interface DasApiAssetSupply {
  /** The maximum print supply. */
  print_max_supply?: number;
  /** The current print supply. */
  print_current_supply?: number;
  /** The edition nonce. */
  edition_nonce?: number | null;
  /** The address of the master edition, for printed editions. */
  master_edition_mint?: Address;
  /** The edition number, for printed editions. */
  edition_number?: number;
}

/**
 * "Uses" information for an asset.
 */
export interface DasApiUses {
  /** The use method. */
  use_method: DasApiUseMethod;
  /** The remaining number of uses. */
  remaining: number;
  /** The total number of uses. */
  total: number;
}

/**
 * Pricing information for a fungible token (Helius extension).
 */
export interface DasApiPriceInfo {
  /** The price per token. */
  price_per_token: number;
  /** The total price of the held balance. */
  total_price?: number;
  /** The currency the price is denominated in. */
  currency?: string;
}

/**
 * Token information for a fungible asset (Helius extension).
 */
export interface DasApiTokenInfo {
  /** The symbol of the token. */
  symbol?: string;
  /** The balance held by the queried owner, in base units. */
  balance?: number;
  /** The total supply of the token, in base units. */
  supply?: number;
  /** The number of decimals of the token. */
  decimals?: number;
  /** The token program that owns the mint. */
  token_program?: Address;
  /** The associated token account for the queried owner. */
  associated_token_address?: Address;
  /** Pricing information for the token. */
  price_info?: DasApiPriceInfo;
  /** The mint authority of the token. */
  mint_authority?: Address;
  /** The freeze authority of the token. */
  freeze_authority?: Address;
}

/**
 * Inscription information for an asset (Helius extension).
 */
export interface DasApiInscription {
  /** The inscription order. */
  order?: number;
  /** The size of the inscription data, in bytes. */
  size?: number;
  /** The content type of the inscription. */
  contentType?: string;
  /** The encoding of the inscription. */
  encoding?: string;
  /** The validation hash of the inscription. */
  validationHash?: string;
  /** The account holding the inscription data. */
  inscriptionDataAccount?: Address;
  /** The authority of the inscription. */
  authority?: Address;
}

/**
 * A per-epoch transfer fee configuration (Token-2022).
 */
export interface DasApiTransferFee {
  /** The epoch the fee takes effect. */
  epoch: number;
  /** The maximum fee, in base units. */
  maximum_fee: number;
  /** The transfer fee, in basis points. */
  transfer_fee_basis_points: number;
}

/**
 * The Token-2022 transfer fee config extension.
 */
export interface DasApiTransferFeeConfig {
  /** The authority that can change the fee config. */
  transfer_fee_config_authority?: Address;
  /** The authority that can withdraw withheld tokens. */
  withdraw_withheld_authority?: Address;
  /** The amount of withheld tokens. */
  withheld_amount?: number;
  /** The currently active transfer fee. */
  older_transfer_fee?: DasApiTransferFee;
  /** The pending transfer fee. */
  newer_transfer_fee?: DasApiTransferFee;
}

/**
 * The Token-2022 transfer hook extension.
 */
export interface DasApiTransferHook {
  /** The authority that can change the transfer hook program. */
  authority?: Address;
  /** The transfer hook program id. */
  program_id?: Address;
}

/**
 * The Token-2022 metadata pointer extension.
 */
export interface DasApiMetadataPointer {
  /** The authority that can change the metadata address. */
  authority?: Address;
  /** The address holding the token metadata. */
  metadata_address?: Address;
}

/**
 * The Token-2022 group / group member pointer extension.
 */
export interface DasApiGroupPointer {
  /** The authority that can change the pointer. */
  authority?: Address;
  /** The address of the group. */
  group_address?: Address;
  /** The address of the group member. */
  member_address?: Address;
}

/**
 * The Token-2022 mint close authority extension.
 */
export interface DasApiMintCloseAuthority {
  /** The authority that can close the mint. */
  close_authority?: Address;
}

/**
 * The Token-2022 permanent delegate extension.
 */
export interface DasApiPermanentDelegate {
  /** The permanent delegate over every token account. */
  delegate?: Address;
}

/**
 * The Token-2022 default account state extension.
 */
export interface DasApiDefaultAccountState {
  /** The default state of new token accounts. */
  state?: string;
}

/**
 * The Token-2022 interest bearing config extension.
 */
export interface DasApiInterestBearingConfig {
  /** The authority that can change the interest rate. */
  rate_authority?: Address;
  /** The timestamp the config was initialized. */
  initialization_timestamp?: number;
  /** The average rate before the last update. */
  pre_update_average_rate?: number;
  /** The timestamp of the last update. */
  last_update_timestamp?: number;
  /** The current interest rate, in basis points. */
  current_rate?: number;
}

/**
 * The Token-2022 metadata extension.
 */
export interface DasApiTokenMetadataExtension {
  /** The authority that can change the metadata. */
  update_authority?: Address;
  /** The mint the metadata belongs to. */
  mint?: Address;
  /** The name of the token. */
  name?: string;
  /** The symbol of the token. */
  symbol?: string;
  /** The URI of the off-chain metadata. */
  uri?: string;
  /** Arbitrary additional metadata, as `[key, value]` pairs. */
  additional_metadata?: [key: string, value: string][];
}

/**
 * Token-2022 mint extensions attached to an asset (Helius extension).
 *
 * The most common extensions are typed explicitly. Less common extensions are
 * exposed as {@link JsonValue}; extend this interface via declaration merging to
 * type additional extensions.
 */
export interface DasApiMintExtensions {
  confidential_transfer_account?: JsonValue;
  confidential_transfer_mint?: JsonValue;
  confidential_transfer_fee_config?: JsonValue;
  default_account_state?: DasApiDefaultAccountState;
  group_member_pointer?: DasApiGroupPointer;
  group_pointer?: DasApiGroupPointer;
  interest_bearing_config?: DasApiInterestBearingConfig;
  metadata?: DasApiTokenMetadataExtension;
  metadata_pointer?: DasApiMetadataPointer;
  mint_close_authority?: DasApiMintCloseAuthority;
  permanent_delegate?: DasApiPermanentDelegate;
  token_group?: JsonValue;
  token_group_member?: JsonValue;
  transfer_fee_config?: DasApiTransferFeeConfig;
  transfer_hook?: DasApiTransferHook;
}

/**
 * Additional fields present on an asset when its interface is an MPL Core
 * interface (`MplCoreAsset` or `MplCoreCollection`).
 *
 * It is recommended to use the `mpl-core-das` package alongside this one to
 * convert these into the types used by `mpl-core` (e.g. `AssetV1`).
 */
export interface DasApiCoreAssetFields {
  /** Plugins active on the asset or collection. */
  plugins?: Record<string, JsonValue>;
  /** External plugins active on the asset or collection. */
  external_plugins?: JsonValue[];
  /** Plugins that were unknown to the indexer at the time of indexing. */
  unknown_plugins?: JsonValue[];
  /** External plugins that were unknown to the indexer at the time of indexing. */
  unknown_external_plugins?: JsonValue[];
  /** Additional indexed fields for Core assets or collections. */
  mpl_core_info?: {
    /** Number of assets minted into this collection (collections only). */
    num_minted?: number;
    /** Current number of assets in this collection (collections only). */
    current_size?: number;
    /** The version of the plugins JSON schema. */
    plugins_json_version?: number;
  };
}

/**
 * A representation of a digital asset returned by the DAS API.
 *
 * This is the union of the Metaplex Digital Asset Standard asset shape and the
 * Helius extensions (`token_info`, `mint_extensions`, `inscription`, etc.).
 */
export interface DasApiAsset extends DasApiCoreAssetFields {
  /** The interface (kind) of the asset. */
  interface: DasApiAssetInterface;
  /** The id (mint/asset address) of the asset. */
  id: Address;
  /** The content of the asset (metadata, files, links). */
  content: DasApiAssetContent;
  /** The list of authorities over the asset. */
  authorities: DasApiAssetAuthority[];
  /** Compression information for the asset. */
  compression: DasApiAssetCompression;
  /** Grouping information for the asset. */
  grouping: DasApiAssetGrouping[];
  /** Royalty information for the asset. */
  royalty: DasApiAssetRoyalty;
  /** The list of creators of the asset. */
  creators: DasApiAssetCreator[];
  /** Ownership information for the asset. */
  ownership: DasApiAssetOwnership;
  /** "Uses" information for the asset, if any. */
  uses?: DasApiUses;
  /** Supply information for the asset, if any. */
  supply?: DasApiAssetSupply | null;
  /** Whether the asset's metadata is mutable. */
  mutable: boolean;
  /** Whether the asset has been burnt. */
  burnt: boolean;
  /** Token information for a fungible asset (Helius extension). */
  token_info?: DasApiTokenInfo;
  /** Token-2022 mint extensions (Helius extension). */
  mint_extensions?: DasApiMintExtensions;
  /** Inscription information (Helius extension). */
  inscription?: DasApiInscription;
  /** SPL-20 data (Helius extension). */
  spl20?: Record<string, JsonValue>;
  /** The most recent slot at which the asset was indexed (Helius extension). */
  last_indexed_slot?: number;
}
