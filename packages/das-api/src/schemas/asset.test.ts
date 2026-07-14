import type { DasApiAsset } from "../types/asset.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import {
  dasApiAssetAuthoritySchema,
  dasApiAssetCompressionSchema,
  dasApiAssetContentSchema,
  dasApiAssetCreatorSchema,
  dasApiAssetFileSchema,
  dasApiAssetGroupingSchema,
  dasApiAssetLinksSchema,
  dasApiAssetOwnershipSchema,
  dasApiAssetRoyaltySchema,
  dasApiAssetSchema,
  dasApiAssetSupplySchema,
  dasApiCollectionMetadataSchema,
  dasApiDefaultAccountStateSchema,
  dasApiGroupPointerSchema,
  dasApiInscriptionSchema,
  dasApiInterestBearingConfigSchema,
  dasApiMetadataAttributeSchema,
  dasApiMetadataPointerSchema,
  dasApiMetadataSchema,
  dasApiMintCloseAuthoritySchema,
  dasApiMintExtensionsSchema,
  dasApiPermanentDelegateSchema,
  dasApiPriceInfoSchema,
  dasApiTokenInfoSchema,
  dasApiTokenMetadataExtensionSchema,
  dasApiTransferFeeConfigSchema,
  dasApiTransferFeeSchema,
  dasApiTransferHookSchema,
  dasApiUsesSchema,
} from "./asset.js";

const ASSET_ID = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const AUTHORITY = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const TREE = "So11111111111111111111111111111111111111112";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const ATA = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

/**
 * A compressed NFT with every optional field populated, including the Helius
 * extensions and the MPL Core fields.
 */
const FULL_ASSET = {
  interface: "V1_NFT",
  id: ASSET_ID,
  content: {
    $schema: "https://schema.metaplex.com/nft1.0.json",
    json_uri: "https://example.com/metadata.json",
    files: [
      {
        uri: "https://example.com/image.png",
        mime: "image/png",
        cdn_uri: "https://cdn.example.com/image.png",
        contexts: ["full"],
      },
    ],
    metadata: {
      name: "Test NFT",
      symbol: "TEST",
      description: "A test NFT",
      token_standard: "NonFungible",
      attributes: [
        { trait_type: "Background", value: "Blue", display_type: "string" },
        { trait_type: "Level", value: 3 },
      ],
    },
    links: {
      image: "https://example.com/image.png",
      animation_url: "https://example.com/animation.mp4",
      external_url: "https://example.com",
    },
  },
  authorities: [{ address: AUTHORITY, scopes: ["full", "metadata"] }],
  compression: {
    eligible: true,
    compressed: true,
    data_hash: ASSET_ID,
    creator_hash: OWNER,
    collection_hash: AUTHORITY,
    asset_data_hash: TREE,
    flags: 1,
    asset_hash: TOKEN_PROGRAM,
    tree: TREE,
    seq: 12,
    leaf_id: 7,
  },
  grouping: [
    {
      group_key: "collection",
      group_value: AUTHORITY,
      verified: true,
      collection_metadata: {
        name: "Test Collection",
        symbol: "TC",
        description: "A test collection",
        image: "https://example.com/collection.png",
        external_url: "https://example.com/collection",
      },
    },
  ],
  royalty: {
    royalty_model: "creators",
    target: null,
    percent: 0.05,
    basis_points: 500,
    primary_sale_happened: true,
    locked: false,
  },
  creators: [{ address: OWNER, share: 100, verified: true }],
  ownership: {
    frozen: false,
    non_transferable: false,
    delegated: true,
    delegate: AUTHORITY,
    ownership_model: "single",
    owner: OWNER,
  },
  uses: { use_method: "burn", remaining: 1, total: 3 },
  supply: {
    print_max_supply: 100,
    print_current_supply: 4,
    edition_nonce: 254,
    master_edition_mint: ASSET_ID,
    edition_number: 4,
  },
  mutable: true,
  burnt: false,
  token_info: {
    symbol: "TEST",
    balance: 1,
    supply: 1,
    decimals: 0,
    token_program: TOKEN_PROGRAM,
    associated_token_address: ATA,
    price_info: {
      price_per_token: 1.5,
      total_price: 1.5,
      currency: "USDC",
    },
    mint_authority: AUTHORITY,
    freeze_authority: AUTHORITY,
  },
  mint_extensions: {
    transfer_fee_config: {
      transfer_fee_config_authority: AUTHORITY,
      withdraw_withheld_authority: AUTHORITY,
      withheld_amount: 0,
      older_transfer_fee: {
        epoch: 100,
        maximum_fee: 1000,
        transfer_fee_basis_points: 50,
      },
      newer_transfer_fee: {
        epoch: 101,
        maximum_fee: 2000,
        transfer_fee_basis_points: 75,
      },
    },
    metadata: {
      update_authority: AUTHORITY,
      mint: ASSET_ID,
      name: "Test NFT",
      symbol: "TEST",
      uri: "https://example.com/metadata.json",
      additional_metadata: [["key", "value"]],
    },
    confidential_transfer_mint: { authority: AUTHORITY, auto_approve: true },
  },
  inscription: {
    order: 1,
    size: 128,
    contentType: "application/text",
    encoding: "base64",
    validationHash: "abc123",
    inscriptionDataAccount: SYSTEM_PROGRAM,
    authority: AUTHORITY,
  },
  spl20: { p: "spl-20", op: "mint", tick: "test" },
  last_indexed_slot: 123_456_789,
  plugins: { attributes: { data: { attribute_list: [] } } },
  external_plugins: [],
  unknown_plugins: [],
  unknown_external_plugins: [],
  mpl_core_info: {
    num_minted: 10,
    current_size: 8,
    plugins_json_version: 1,
  },
};

/**
 * A regular (uncompressed) NFT, shaped the way indexers actually return one:
 * empty-string compression hashes and a null supply.
 */
const UNCOMPRESSED_ASSET = {
  interface: "ProgrammableNFT",
  id: ASSET_ID,
  content: {
    json_uri: "https://example.com/metadata.json",
    metadata: { name: "Test NFT", symbol: "TEST" },
  },
  authorities: [{ address: AUTHORITY, scopes: ["full"] }],
  compression: {
    eligible: false,
    compressed: false,
    data_hash: "",
    creator_hash: "",
    asset_hash: "",
    tree: "",
    seq: 0,
    leaf_id: 0,
  },
  grouping: [],
  royalty: {
    royalty_model: "creators",
    target: null,
    percent: 0.042,
    basis_points: 420,
    primary_sale_happened: true,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: true,
    delegated: false,
    delegate: null,
    ownership_model: "single",
    owner: OWNER,
  },
  supply: null,
  mutable: true,
  burnt: false,
};

describe("dasApiAssetSchema", () => {
  it("parses a fully-populated compressed asset", () => {
    const asset: DasApiAsset = dasApiAssetSchema.parse(FULL_ASSET);

    expect(asset.id).toBe(address(ASSET_ID));
    expect(asset.interface).toBe("V1_NFT");
    expect(asset.content.metadata.name).toBe("Test NFT");
    expect(asset.content.metadata.attributes?.[1]?.value).toBe(3);
    expect(asset.authorities[0]?.address).toBe(address(AUTHORITY));
    expect(asset.compression.tree).toBe(address(TREE));
    expect(asset.grouping[0]?.collection_metadata?.name).toBe(
      "Test Collection",
    );
    expect(asset.royalty.target).toBeNull();
    expect(asset.creators[0]?.address).toBe(address(OWNER));
    expect(asset.ownership.delegate).toBe(address(AUTHORITY));
    expect(asset.uses?.use_method).toBe("burn");
    expect(asset.supply?.master_edition_mint).toBe(address(ASSET_ID));
    expect(asset.token_info?.associated_token_address).toBe(address(ATA));
    expect(
      asset.mint_extensions?.transfer_fee_config?.older_transfer_fee?.epoch,
    ).toBe(100);
    expect(asset.mint_extensions?.metadata?.additional_metadata).toEqual([
      ["key", "value"],
    ]);
    expect(asset.inscription?.inscriptionDataAccount).toBe(
      address(SYSTEM_PROGRAM),
    );
    expect(asset.spl20?.["tick"]).toBe("test");
    expect(asset.last_indexed_slot).toBe(123_456_789);
    expect(asset.mpl_core_info?.num_minted).toBe(10);
  });

  it("parses a regular NFT with empty compression hashes and a null supply", () => {
    const asset: DasApiAsset = dasApiAssetSchema.parse(UNCOMPRESSED_ASSET);

    expect(asset.compression.compressed).toBe(false);
    // Typed as `Address` (that is what the indexer's shape claims), but empty in
    // practice for uncompressed assets, so compare as a plain string.
    expect(asset.compression.data_hash as string).toBe("");
    expect(asset.compression.tree as string).toBe("");
    expect(asset.supply).toBeNull();
    expect(asset.ownership.delegate).toBeNull();
    expect(asset.uses).toBeUndefined();
  });

  it("preserves provider-specific fields it does not know about", () => {
    const asset = dasApiAssetSchema.parse({
      ...UNCOMPRESSED_ASSET,
      some_future_helius_field: { nested: true },
    });

    expect(asset).toHaveProperty("some_future_helius_field", { nested: true });
  });

  it("rejects an asset whose id is not a valid address", () => {
    expect(() =>
      dasApiAssetSchema.parse({ ...UNCOMPRESSED_ASSET, id: "not-an-address" }),
    ).toThrow();
  });

  it("rejects an asset with an unknown interface", () => {
    expect(() =>
      dasApiAssetSchema.parse({ ...UNCOMPRESSED_ASSET, interface: "V9_NFT" }),
    ).toThrow();
  });

  it("rejects an asset that is missing a required field", () => {
    const { burnt: _burnt, ...withoutBurnt } = UNCOMPRESSED_ASSET;

    expect(() => dasApiAssetSchema.parse(withoutBurnt)).toThrow();
  });

  it("rejects a non-object", () => {
    expect(() => dasApiAssetSchema.parse(null)).toThrow();
  });
});

describe("asset sub-schemas", () => {
  it("dasApiAssetFileSchema parses a file", () => {
    expect(
      dasApiAssetFileSchema.parse({ uri: "https://x.test", mime: "image/png" }),
    ).toEqual({ uri: "https://x.test", mime: "image/png" });
    expect(() => dasApiAssetFileSchema.parse({ uri: 1 })).toThrow();
  });

  it("dasApiMetadataAttributeSchema accepts string and number values", () => {
    expect(
      dasApiMetadataAttributeSchema.parse({ trait_type: "a", value: "b" })
        .value,
    ).toBe("b");
    expect(
      dasApiMetadataAttributeSchema.parse({ trait_type: "a", value: 2 }).value,
    ).toBe(2);
    expect(() =>
      dasApiMetadataAttributeSchema.parse({ trait_type: "a", value: true }),
    ).toThrow();
  });

  it("dasApiMetadataSchema requires a name and symbol", () => {
    expect(dasApiMetadataSchema.parse({ name: "n", symbol: "s" }).name).toBe(
      "n",
    );
    expect(() => dasApiMetadataSchema.parse({ name: "n" })).toThrow();
  });

  it("dasApiAssetLinksSchema parses links", () => {
    expect(dasApiAssetLinksSchema.parse({ image: "https://x.test" })).toEqual({
      image: "https://x.test",
    });
    expect(() => dasApiAssetLinksSchema.parse({ image: 1 })).toThrow();
  });

  it("dasApiAssetContentSchema requires json_uri and metadata", () => {
    const content = dasApiAssetContentSchema.parse(FULL_ASSET.content);

    expect(content.json_uri).toBe("https://example.com/metadata.json");
    expect(content.$schema).toBe("https://schema.metaplex.com/nft1.0.json");
    expect(() =>
      dasApiAssetContentSchema.parse({ json_uri: "https://x.test" }),
    ).toThrow();
  });

  it("dasApiAssetAuthoritySchema validates the scopes", () => {
    expect(
      dasApiAssetAuthoritySchema.parse({
        address: AUTHORITY,
        scopes: ["royalty"],
      }).address,
    ).toBe(address(AUTHORITY));
    expect(() =>
      dasApiAssetAuthoritySchema.parse({
        address: AUTHORITY,
        scopes: ["bogus"],
      }),
    ).toThrow();
  });

  it("dasApiAssetCompressionSchema rejects a malformed hash", () => {
    expect(dasApiAssetCompressionSchema.parse(FULL_ASSET.compression).seq).toBe(
      12,
    );
    expect(() =>
      dasApiAssetCompressionSchema.parse({
        ...FULL_ASSET.compression,
        data_hash: "!!!",
      }),
    ).toThrow();
  });

  it("dasApiCollectionMetadataSchema parses collection metadata", () => {
    expect(dasApiCollectionMetadataSchema.parse({ name: "c" }).name).toBe("c");
    expect(() => dasApiCollectionMetadataSchema.parse({ name: 1 })).toThrow();
  });

  it("dasApiAssetGroupingSchema requires a known group key", () => {
    expect(
      dasApiAssetGroupingSchema.parse({
        group_key: "collection",
        group_value: AUTHORITY,
      }).group_value,
    ).toBe(AUTHORITY);
    expect(() =>
      dasApiAssetGroupingSchema.parse({
        group_key: "family",
        group_value: AUTHORITY,
      }),
    ).toThrow();
  });

  it("dasApiAssetRoyaltySchema accepts a non-null target", () => {
    const royalty = dasApiAssetRoyaltySchema.parse({
      ...FULL_ASSET.royalty,
      royalty_model: "fanout",
      target: OWNER,
    });

    expect(royalty.target).toBe(address(OWNER));
    expect(() =>
      dasApiAssetRoyaltySchema.parse({
        ...FULL_ASSET.royalty,
        royalty_model: "unknown",
      }),
    ).toThrow();
  });

  it("dasApiAssetCreatorSchema parses a creator", () => {
    expect(
      dasApiAssetCreatorSchema.parse({
        address: OWNER,
        share: 50,
        verified: false,
      }).share,
    ).toBe(50);
    expect(() =>
      dasApiAssetCreatorSchema.parse({ address: OWNER, share: 50 }),
    ).toThrow();
  });

  it("dasApiAssetOwnershipSchema parses ownership", () => {
    expect(
      dasApiAssetOwnershipSchema.parse(UNCOMPRESSED_ASSET.ownership).owner,
    ).toBe(address(OWNER));
    expect(() =>
      dasApiAssetOwnershipSchema.parse({
        ...UNCOMPRESSED_ASSET.ownership,
        ownership_model: "shared",
      }),
    ).toThrow();
  });

  it("dasApiAssetSupplySchema accepts a null edition_nonce", () => {
    expect(
      dasApiAssetSupplySchema.parse({ edition_nonce: null }).edition_nonce,
    ).toBeNull();
    expect(dasApiAssetSupplySchema.parse({}).edition_nonce).toBeUndefined();
    expect(() =>
      dasApiAssetSupplySchema.parse({ print_max_supply: "many" }),
    ).toThrow();
  });

  it("dasApiUsesSchema parses uses", () => {
    expect(
      dasApiUsesSchema.parse({
        use_method: "multiple",
        remaining: 1,
        total: 2,
      }).use_method,
    ).toBe("multiple");
    expect(() =>
      dasApiUsesSchema.parse({ use_method: "burn", remaining: 1 }),
    ).toThrow();
  });

  it("dasApiPriceInfoSchema requires a price_per_token", () => {
    expect(
      dasApiPriceInfoSchema.parse({ price_per_token: 2 }).price_per_token,
    ).toBe(2);
    expect(() => dasApiPriceInfoSchema.parse({})).toThrow();
  });

  it("dasApiTokenInfoSchema parses token info", () => {
    expect(
      dasApiTokenInfoSchema.parse(FULL_ASSET.token_info).token_program,
    ).toBe(address(TOKEN_PROGRAM));
    expect(() =>
      dasApiTokenInfoSchema.parse({ token_program: "nope" }),
    ).toThrow();
  });

  it("dasApiInscriptionSchema parses an inscription", () => {
    expect(dasApiInscriptionSchema.parse(FULL_ASSET.inscription).order).toBe(1);
    expect(() => dasApiInscriptionSchema.parse({ order: "1" })).toThrow();
  });

  it("dasApiTransferFeeSchema parses a transfer fee", () => {
    expect(
      dasApiTransferFeeSchema.parse({
        epoch: 1,
        maximum_fee: 2,
        transfer_fee_basis_points: 3,
      }).maximum_fee,
    ).toBe(2);
    expect(() => dasApiTransferFeeSchema.parse({ epoch: 1 })).toThrow();
  });

  it("dasApiTransferFeeConfigSchema parses a transfer fee config", () => {
    expect(
      dasApiTransferFeeConfigSchema.parse(
        FULL_ASSET.mint_extensions.transfer_fee_config,
      ).withheld_amount,
    ).toBe(0);
    expect(() =>
      dasApiTransferFeeConfigSchema.parse({ withheld_amount: "0" }),
    ).toThrow();
  });

  it("dasApiTransferHookSchema parses a transfer hook", () => {
    expect(
      dasApiTransferHookSchema.parse({
        authority: AUTHORITY,
        program_id: SYSTEM_PROGRAM,
      }).program_id,
    ).toBe(address(SYSTEM_PROGRAM));
    expect(() =>
      dasApiTransferHookSchema.parse({ program_id: "bad" }),
    ).toThrow();
  });

  it("dasApiMetadataPointerSchema parses a metadata pointer", () => {
    expect(
      dasApiMetadataPointerSchema.parse({ metadata_address: ASSET_ID })
        .metadata_address,
    ).toBe(address(ASSET_ID));
    expect(() =>
      dasApiMetadataPointerSchema.parse({ metadata_address: "bad" }),
    ).toThrow();
  });

  it("dasApiGroupPointerSchema parses a group pointer", () => {
    expect(
      dasApiGroupPointerSchema.parse({
        group_address: ASSET_ID,
        member_address: OWNER,
      }).member_address,
    ).toBe(address(OWNER));
    expect(() =>
      dasApiGroupPointerSchema.parse({ group_address: "bad" }),
    ).toThrow();
  });

  it("dasApiMintCloseAuthoritySchema parses a close authority", () => {
    expect(
      dasApiMintCloseAuthoritySchema.parse({ close_authority: AUTHORITY })
        .close_authority,
    ).toBe(address(AUTHORITY));
    expect(() =>
      dasApiMintCloseAuthoritySchema.parse({ close_authority: "bad" }),
    ).toThrow();
  });

  it("dasApiPermanentDelegateSchema parses a permanent delegate", () => {
    expect(
      dasApiPermanentDelegateSchema.parse({ delegate: AUTHORITY }).delegate,
    ).toBe(address(AUTHORITY));
    expect(() =>
      dasApiPermanentDelegateSchema.parse({ delegate: "bad" }),
    ).toThrow();
  });

  it("dasApiDefaultAccountStateSchema parses a default account state", () => {
    expect(
      dasApiDefaultAccountStateSchema.parse({ state: "frozen" }).state,
    ).toBe("frozen");
    expect(() => dasApiDefaultAccountStateSchema.parse({ state: 1 })).toThrow();
  });

  it("dasApiInterestBearingConfigSchema parses an interest bearing config", () => {
    expect(
      dasApiInterestBearingConfigSchema.parse({
        rate_authority: AUTHORITY,
        current_rate: 500,
      }).current_rate,
    ).toBe(500);
    expect(() =>
      dasApiInterestBearingConfigSchema.parse({ current_rate: "500" }),
    ).toThrow();
  });

  it("dasApiTokenMetadataExtensionSchema parses additional_metadata pairs", () => {
    expect(
      dasApiTokenMetadataExtensionSchema.parse({
        additional_metadata: [["a", "b"]],
      }).additional_metadata,
    ).toEqual([["a", "b"]]);
    expect(() =>
      dasApiTokenMetadataExtensionSchema.parse({
        additional_metadata: [["a", 1]],
      }),
    ).toThrow();
  });

  it("dasApiMintExtensionsSchema parses typed and untyped extensions", () => {
    const extensions = dasApiMintExtensionsSchema.parse({
      ...FULL_ASSET.mint_extensions,
      default_account_state: { state: "initialized" },
      group_pointer: { authority: AUTHORITY },
      group_member_pointer: { authority: AUTHORITY },
      interest_bearing_config: { current_rate: 1 },
      metadata_pointer: { metadata_address: ASSET_ID },
      mint_close_authority: { close_authority: AUTHORITY },
      permanent_delegate: { delegate: AUTHORITY },
      transfer_hook: { program_id: SYSTEM_PROGRAM },
      token_group: { max_size: 100 },
      token_group_member: null,
      confidential_transfer_account: [1, 2, 3],
      confidential_transfer_fee_config: "opaque",
    });

    expect(extensions.default_account_state?.state).toBe("initialized");
    expect(extensions.token_group).toEqual({ max_size: 100 });
    expect(extensions.confidential_transfer_account).toEqual([1, 2, 3]);
    expect(extensions.confidential_transfer_mint).toEqual({
      authority: AUTHORITY,
      auto_approve: true,
    });
    expect(() =>
      dasApiMintExtensionsSchema.parse({ transfer_hook: { program_id: 1 } }),
    ).toThrow();
  });
});
