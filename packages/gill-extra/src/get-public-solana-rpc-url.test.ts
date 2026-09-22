import { describe, expect, it } from "bun:test";
import { getPublicSolanaRpcUrl } from "./get-public-solana-rpc-url.js";

describe("getPublicSolanaRpcUrl", () => {
  it("resolves the public cluster endpoints", () => {
    expect(getPublicSolanaRpcUrl("devnet")).toBe(
      "https://api.devnet.solana.com",
    );
    expect(getPublicSolanaRpcUrl("testnet")).toBe(
      "https://api.testnet.solana.com",
    );
    expect(getPublicSolanaRpcUrl("mainnet")).toBe(
      "https://api.mainnet-beta.solana.com",
    );
    expect(getPublicSolanaRpcUrl("mainnet-beta")).toBe(
      "https://api.mainnet-beta.solana.com",
    );
  });

  it("resolves a local validator", () => {
    expect(getPublicSolanaRpcUrl("localnet")).toBe("http://127.0.0.1:8899");
    expect(getPublicSolanaRpcUrl("localhost")).toBe("http://127.0.0.1:8899");
  });

  it("rejects a moniker it does not know", () => {
    expect(() =>
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the point
      // of the test is the runtime guard behind the type.
      getPublicSolanaRpcUrl("nope" as "devnet"),
    ).toThrow("Invalid cluster moniker");
  });
});
