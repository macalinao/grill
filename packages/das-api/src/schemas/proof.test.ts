import type {
  GetAssetProofBatchResponse,
  GetAssetProofResponse,
} from "../types/proof.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import {
  getAssetProofBatchResponseSchema,
  getAssetProofResponseSchema,
} from "./proof.js";

const ASSET_ID = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const ROOT = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const LEAF = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const TREE = "So11111111111111111111111111111111111111112";
const NODE = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

const PROOF = {
  root: ROOT,
  proof: [NODE, TREE],
  node_index: 16_384,
  leaf: LEAF,
  tree_id: TREE,
};

describe("getAssetProofResponseSchema", () => {
  it("parses a merkle proof", () => {
    const proof: GetAssetProofResponse =
      getAssetProofResponseSchema.parse(PROOF);

    expect(proof.root).toBe(address(ROOT));
    expect(proof.proof).toEqual([address(NODE), address(TREE)]);
    expect(proof.node_index).toBe(16_384);
    expect(proof.leaf).toBe(address(LEAF));
    expect(proof.tree_id).toBe(address(TREE));
  });

  it("parses a proof with an empty proof path", () => {
    expect(
      getAssetProofResponseSchema.parse({ ...PROOF, proof: [] }).proof,
    ).toEqual([]);
  });

  it("rejects a proof containing an invalid node hash", () => {
    expect(() =>
      getAssetProofResponseSchema.parse({ ...PROOF, proof: ["nope"] }),
    ).toThrow();
  });

  it("rejects a proof that is missing a field", () => {
    const { leaf: _leaf, ...withoutLeaf } = PROOF;

    expect(() => getAssetProofResponseSchema.parse(withoutLeaf)).toThrow();
  });
});

describe("getAssetProofBatchResponseSchema", () => {
  it("parses a map of asset id to proof", () => {
    const proofs: GetAssetProofBatchResponse =
      getAssetProofBatchResponseSchema.parse({ [ASSET_ID]: PROOF });

    expect(proofs[address(ASSET_ID)]?.root).toBe(address(ROOT));
  });

  it("parses null entries for assets without a proof", () => {
    const proofs = getAssetProofBatchResponseSchema.parse({
      [ASSET_ID]: null,
    });

    expect(proofs[address(ASSET_ID)]).toBeNull();
  });

  it("parses an empty batch", () => {
    expect(getAssetProofBatchResponseSchema.parse({})).toEqual({});
  });

  it("rejects a batch keyed by something that is not an address", () => {
    expect(() =>
      getAssetProofBatchResponseSchema.parse({ "not-an-address": PROOF }),
    ).toThrow();
  });

  it("rejects a batch with a malformed proof", () => {
    expect(() =>
      getAssetProofBatchResponseSchema.parse({
        [ASSET_ID]: { ...PROOF, root: "bad" },
      }),
    ).toThrow();
  });
});
