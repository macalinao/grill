import type { SolanaCluster } from "@macalinao/grill";
import { describe, expect, test } from "bun:test";
import { getPrivySolanaChain } from "./get-privy-solana-chain.js";

describe("getPrivySolanaChain", () => {
  test("maps mainnet-beta to Privy's mainnet chain", () => {
    expect(getPrivySolanaChain("mainnet-beta")).toBe("solana:mainnet");
  });

  test("maps devnet to Privy's devnet chain", () => {
    expect(getPrivySolanaChain("devnet")).toBe("solana:devnet");
  });

  test("maps testnet to Privy's testnet chain", () => {
    expect(getPrivySolanaChain("testnet")).toBe("solana:testnet");
  });

  test("rejects localnet, which Privy cannot reach", () => {
    expect(() => getPrivySolanaChain("localnet")).toThrow(
      'Privy does not support the "localnet" cluster.',
    );
  });

  test("rejects a cluster it does not know", () => {
    expect(() => getPrivySolanaChain("mainnet" as SolanaCluster)).toThrow(
      'Privy does not support the "mainnet" cluster.',
    );
  });
});
