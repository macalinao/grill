import type { DevnetUrl, MainnetUrl, TestnetUrl } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { getPublicSolanaRpcUrl } from "./get-public-solana-rpc-url.js";

describe("getPublicSolanaRpcUrl", () => {
  it("resolves the public cluster endpoints", () => {
    expect<string>(getPublicSolanaRpcUrl("devnet")).toBe(
      "https://api.devnet.solana.com",
    );
    expect<string>(getPublicSolanaRpcUrl("testnet")).toBe(
      "https://api.testnet.solana.com",
    );
    expect<string>(getPublicSolanaRpcUrl("mainnet")).toBe(
      "https://api.mainnet-beta.solana.com",
    );
    expect<string>(getPublicSolanaRpcUrl("mainnet-beta")).toBe(
      "https://api.mainnet-beta.solana.com",
    );
  });

  it("brands public cluster URLs with kit's cluster URL types", () => {
    // Type-level assertions: each moniker resolves to kit's branded URL, so an
    // RPC built from it is typed with that cluster's methods.
    const mainnetUrl: MainnetUrl = getPublicSolanaRpcUrl("mainnet");
    const mainnetBetaUrl: MainnetUrl = getPublicSolanaRpcUrl("mainnet-beta");
    const devnetUrl: DevnetUrl = getPublicSolanaRpcUrl("devnet");
    const testnetUrl: TestnetUrl = getPublicSolanaRpcUrl("testnet");
    expect([mainnetUrl, mainnetBetaUrl, devnetUrl, testnetUrl]).toHaveLength(4);
  });

  it("resolves a local validator to the exact URL solanaRpcConnection maps to ws port 8900", () => {
    const localnetUrl: string = getPublicSolanaRpcUrl("localnet");
    expect(localnetUrl).toBe("http://127.0.0.1:8899");
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
