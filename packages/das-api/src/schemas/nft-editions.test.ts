import type { GetNftEditionsResponse } from "../types/nft-editions.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import {
  dasApiNftEditionSchema,
  getNftEditionsResponseSchema,
} from "./nft-editions.js";

const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const EDITION_ADDRESS = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const MASTER_EDITION = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

const EDITION = {
  mint: MINT,
  edition_address: EDITION_ADDRESS,
  edition: 1,
};

describe("dasApiNftEditionSchema", () => {
  it("parses an edition", () => {
    const edition = dasApiNftEditionSchema.parse(EDITION);

    expect(edition.mint).toBe(address(MINT));
    expect(edition.edition_address).toBe(address(EDITION_ADDRESS));
    expect(edition.edition).toBe(1);
  });

  it("rejects an edition with an invalid mint", () => {
    expect(() =>
      dasApiNftEditionSchema.parse({ ...EDITION, mint: "bad" }),
    ).toThrow();
  });

  it("rejects an edition that is missing a field", () => {
    const { edition: _edition, ...withoutEdition } = EDITION;

    expect(() => dasApiNftEditionSchema.parse(withoutEdition)).toThrow();
  });
});

describe("getNftEditionsResponseSchema", () => {
  it("parses an editions response", () => {
    const response: GetNftEditionsResponse = getNftEditionsResponseSchema.parse(
      {
        total: 1,
        limit: 100,
        page: 1,
        master_edition_address: MASTER_EDITION,
        supply: 1,
        max_supply: 100,
        editions: [EDITION],
      },
    );

    expect(response.master_edition_address).toBe(address(MASTER_EDITION));
    expect(response.supply).toBe(1);
    expect(response.max_supply).toBe(100);
    expect(response.editions[0]?.mint).toBe(address(MINT));
  });

  it("parses an uncapped master edition with no editions", () => {
    const response = getNftEditionsResponseSchema.parse({
      total: 0,
      limit: 100,
      before: "b",
      after: "a",
      master_edition_address: MASTER_EDITION,
      supply: 0,
      editions: [],
    });

    expect(response.max_supply).toBeUndefined();
    expect(response.before).toBe("b");
    expect(response.after).toBe("a");
    expect(response.editions).toEqual([]);
  });

  it("rejects a response that is missing the master edition address", () => {
    expect(() =>
      getNftEditionsResponseSchema.parse({
        total: 0,
        limit: 100,
        supply: 0,
        editions: [],
      }),
    ).toThrow();
  });
});
