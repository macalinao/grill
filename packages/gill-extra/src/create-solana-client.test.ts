import { describe, expect, it } from "bun:test";
import { createSolanaClient } from "./create-solana-client.js";

describe("createSolanaClient", () => {
  it("exposes an rpc, subscriptions and the transaction helpers", () => {
    const client = createSolanaClient({ urlOrMoniker: "mainnet" });
    expect(Object.keys(client).sort()).toEqual([
      "rpc",
      "rpcSubscriptions",
      "sendAndConfirmTransaction",
      "simulateTransaction",
      "urlOrMoniker",
    ]);
  });

  it("resolves a cluster moniker to its public endpoint", () => {
    expect(createSolanaClient({ urlOrMoniker: "devnet" }).urlOrMoniker).toBe(
      "wss://api.devnet.solana.com/",
    );
    expect(createSolanaClient({ urlOrMoniker: "mainnet" }).urlOrMoniker).toBe(
      "wss://api.mainnet-beta.solana.com/",
    );
  });

  it("moves a local validator's subscriptions to port 8900", () => {
    expect(
      createSolanaClient({ urlOrMoniker: "http://localhost:8899" })
        .urlOrMoniker,
    ).toBe("ws://localhost:8900/");
    expect(createSolanaClient({ urlOrMoniker: "localnet" }).urlOrMoniker).toBe(
      "ws://127.0.0.1:8900/",
    );
  });

  it("honours an explicit port for either client", () => {
    expect(
      createSolanaClient({
        rpcConfig: { port: 1234 },
        urlOrMoniker: "https://rpc.example.com",
      }).urlOrMoniker,
    ).toBe("wss://rpc.example.com:1234/");
    expect(
      createSolanaClient({
        rpcSubscriptionsConfig: { port: 4321 },
        urlOrMoniker: "https://rpc.example.com",
      }).urlOrMoniker,
    ).toBe("wss://rpc.example.com:4321/");
  });

  it("does not mutate a URL it was handed", () => {
    const url = new URL("https://rpc.example.com/");
    createSolanaClient({ urlOrMoniker: url });
    expect(url.toString()).toBe("https://rpc.example.com/");
  });

  it("rejects an empty, unrecognised or non-HTTP endpoint", () => {
    expect(() => createSolanaClient({ urlOrMoniker: "" })).toThrow(
      "Cluster url or moniker is required",
    );
    expect(() => createSolanaClient({ urlOrMoniker: "nope" })).toThrow(
      "Invalid URL or cluster moniker",
    );
    expect(() =>
      createSolanaClient({ urlOrMoniker: "ftp://rpc.example.com" }),
    ).toThrow("Unsupported protocol. Only HTTP and HTTPS are supported");
  });
});
