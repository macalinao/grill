import type { DasApiAssetList } from "../types/asset-list.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import {
  dasApiAssetListSchema,
  dasApiNativeBalanceSchema,
} from "./asset-list.js";

const ASSET_ID = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

const ASSET = {
  interface: "V1_NFT",
  id: ASSET_ID,
  content: {
    json_uri: "https://example.com/metadata.json",
    metadata: { name: "Test NFT", symbol: "TEST" },
  },
  authorities: [],
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
    percent: 0,
    basis_points: 0,
    primary_sale_happened: false,
    locked: false,
  },
  creators: [],
  ownership: {
    frozen: false,
    delegated: false,
    delegate: null,
    ownership_model: "single",
    owner: OWNER,
  },
  mutable: true,
  burnt: false,
};

describe("dasApiNativeBalanceSchema", () => {
  it("parses a native balance", () => {
    const balance = dasApiNativeBalanceSchema.parse({
      lamports: 1_000_000_000,
      price_per_sol: 150.25,
      total_price: 150.25,
    });

    expect(balance.lamports).toBe(1_000_000_000);
    expect(balance.price_per_sol).toBe(150.25);
  });

  it("requires lamports", () => {
    expect(() => dasApiNativeBalanceSchema.parse({})).toThrow();
  });
});

describe("dasApiAssetListSchema", () => {
  it("parses a page-based asset list", () => {
    const list: DasApiAssetList = dasApiAssetListSchema.parse({
      total: 1,
      limit: 1000,
      page: 1,
      items: [ASSET],
    });

    expect(list.total).toBe(1);
    expect(list.page).toBe(1);
    expect(list.items[0]?.id).toBe(address(ASSET_ID));
  });

  it("parses a cursor-based asset list with Helius extras", () => {
    const list: DasApiAssetList = dasApiAssetListSchema.parse({
      total: 2,
      limit: 1000,
      before: "b",
      after: "a",
      cursor: "c",
      items: [ASSET],
      nativeBalance: { lamports: 5 },
      grand_total: 42,
    });

    expect(list.cursor).toBe("c");
    expect(list.before).toBe("b");
    expect(list.after).toBe("a");
    expect(list.nativeBalance?.lamports).toBe(5);
    expect(list.grand_total).toBe(42);
  });

  it("parses an empty list", () => {
    expect(
      dasApiAssetListSchema.parse({ total: 0, limit: 1000, items: [] }).items,
    ).toEqual([]);
  });

  it("rejects a list whose items are not valid assets", () => {
    expect(() =>
      dasApiAssetListSchema.parse({
        total: 1,
        limit: 1000,
        items: [{ ...ASSET, id: "not-an-address" }],
      }),
    ).toThrow();
  });

  it("rejects a list that is missing required fields", () => {
    expect(() =>
      dasApiAssetListSchema.parse({ total: 1, limit: 10 }),
    ).toThrow();
  });
});
