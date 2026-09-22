import { describe, expect, it } from "bun:test";
import { getExplorerLink } from "./get-explorer-link.js";

const SIGNATURE = "5xY7Zq9sFpX8kLnqfRKdKz7hFjDhJpgK3xvMqQJqLxLz";
const ADDRESS = "So11111111111111111111111111111111111111112";

describe("getExplorerLink", () => {
  it("links to the explorer home page when given nothing", () => {
    expect(getExplorerLink()).toBe("https://explorer.solana.com/");
  });

  it("links to an address", () => {
    expect(getExplorerLink({ address: ADDRESS })).toBe(
      `https://explorer.solana.com/address/${ADDRESS}`,
    );
  });

  it("links to a transaction", () => {
    expect(getExplorerLink({ transaction: SIGNATURE })).toBe(
      `https://explorer.solana.com/tx/${SIGNATURE}`,
    );
  });

  it("links to a block, as a string or a number", () => {
    expect(getExplorerLink({ block: "123" })).toBe(
      "https://explorer.solana.com/block/123",
    );
    expect(getExplorerLink({ block: 123 })).toBe(
      "https://explorer.solana.com/block/123",
    );
  });

  it("leaves mainnet unqualified", () => {
    expect(
      getExplorerLink({ cluster: "mainnet", transaction: SIGNATURE }),
    ).toBe(`https://explorer.solana.com/tx/${SIGNATURE}`);
    expect(
      getExplorerLink({ cluster: "mainnet-beta", transaction: SIGNATURE }),
    ).toBe(`https://explorer.solana.com/tx/${SIGNATURE}`);
  });

  it("qualifies devnet and testnet with a cluster parameter", () => {
    expect(getExplorerLink({ cluster: "devnet", transaction: SIGNATURE })).toBe(
      `https://explorer.solana.com/tx/${SIGNATURE}?cluster=devnet`,
    );
    expect(getExplorerLink({ cluster: "testnet", address: ADDRESS })).toBe(
      `https://explorer.solana.com/address/${ADDRESS}?cluster=testnet`,
    );
  });

  it("points a local validator at the custom cluster", () => {
    const expected = `https://explorer.solana.com/tx/${SIGNATURE}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`;
    expect(
      getExplorerLink({ cluster: "localnet", transaction: SIGNATURE }),
    ).toBe(expected);
    expect(
      getExplorerLink({ cluster: "localhost", transaction: SIGNATURE }),
    ).toBe(expected);
  });

  it("prefers an address over a transaction or block", () => {
    expect(
      getExplorerLink({ address: ADDRESS, block: 1, transaction: SIGNATURE }),
    ).toBe(`https://explorer.solana.com/address/${ADDRESS}`);
  });

  it("does not mutate the arguments it is given", () => {
    const args = { cluster: "mainnet", transaction: SIGNATURE } as const;
    getExplorerLink(args);
    expect(args.cluster).toBe("mainnet");
  });
});
