import { describe, expect, it } from "bun:test";
import { buildGetExplorerLinkFunction } from "./build-get-explorer-link-function.js";

describe("buildGetExplorerLinkFunction", () => {
  describe("basic functionality", () => {
    it("should create a function that generates explorer links", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      expect(typeof getLink).toBe("function");
    });

    it("should use default paths when not specified", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      const txLink = getLink({ transaction: "abc123" });
      expect(txLink).toBe("https://explorer.example.com/tx/abc123");

      const addressLink = getLink({ address: "def456" });
      expect(addressLink).toBe("https://explorer.example.com/address/def456");

      const blockLink = getLink({ block: 789 });
      expect(blockLink).toBe("https://explorer.example.com/block/789");
    });

    it("should use custom paths when specified", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
        paths: {
          transaction: "transaction",
          address: "account",
          block: "slot",
        },
      });

      const txLink = getLink({ transaction: "abc123" });
      expect(txLink).toBe("https://explorer.example.com/transaction/abc123");

      const addressLink = getLink({ address: "def456" });
      expect(addressLink).toBe("https://explorer.example.com/account/def456");

      const blockLink = getLink({ block: 789 });
      expect(blockLink).toBe("https://explorer.example.com/slot/789");
    });
  });

  describe("cluster parameters", () => {
    it("should add cluster parameter when configured", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
        clusterParam: {
          name: "network",
          values: {
            devnet: "dev",
            testnet: "test",
          },
        },
      });

      const devnetLink = getLink({
        transaction: "abc123",
        cluster: "devnet",
      });
      expect(devnetLink).toBe(
        "https://explorer.example.com/tx/abc123?network=dev",
      );

      const testnetLink = getLink({
        transaction: "abc123",
        cluster: "testnet",
      });
      expect(testnetLink).toBe(
        "https://explorer.example.com/tx/abc123?network=test",
      );
    });

    it("should not add cluster parameter when value is not defined", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
        clusterParam: {
          name: "cluster",
          values: {
            devnet: "devnet",
            // mainnet not defined
          },
        },
      });

      const mainnetLink = getLink({
        transaction: "abc123",
        cluster: "mainnet",
      });
      expect(mainnetLink).toBe("https://explorer.example.com/tx/abc123");

      const devnetLink = getLink({
        transaction: "abc123",
        cluster: "devnet",
      });
      expect(devnetLink).toBe(
        "https://explorer.example.com/tx/abc123?cluster=devnet",
      );
    });

    it("should not add any parameters when clusterParam is not configured", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      const link = getLink({
        transaction: "abc123",
        cluster: "devnet",
      });
      expect(link).toBe("https://explorer.example.com/tx/abc123");
    });
  });

  describe("edge cases", () => {
    it("should return base URL when no arguments provided", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      const link = getLink();
      expect(link).toBe("https://explorer.example.com/");
    });

    it("should return base URL when empty object provided", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      const link = getLink({});
      expect(link).toBe("https://explorer.example.com/");
    });

    it("should handle baseUrl with trailing slash", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com/",
      });

      const link = getLink({ transaction: "abc123" });
      expect(link).toBe("https://explorer.example.com/tx/abc123");
    });

    it("should handle block as string or number", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      const numberLink = getLink({ block: 123456 });
      expect(numberLink).toBe("https://explorer.example.com/block/123456");

      const stringLink = getLink({ block: "123456" });
      expect(stringLink).toBe("https://explorer.example.com/block/123456");
    });
  });

  describe("URL encoding", () => {
    it("should properly encode special characters in paths", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
      });

      const link = getLink({ transaction: "abc+123/def" });
      // URL constructor handles encoding automatically
      expect(link).toBe("https://explorer.example.com/tx/abc+123/def");
    });

    it("should properly encode cluster parameter values", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.example.com",
        clusterParam: {
          name: "cluster",
          values: {
            devnet: "dev net", // space in value
          },
        },
      });

      const link = getLink({
        transaction: "abc123",
        cluster: "devnet",
      });
      // URLSearchParams should encode the space as +
      expect(link).toBe(
        "https://explorer.example.com/tx/abc123?cluster=dev+net",
      );
    });
  });

  describe("real-world examples", () => {
    it("should work for Solscan-like configuration", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://solscan.io",
        paths: {
          transaction: "tx",
          address: "account",
          block: "block",
        },
        clusterParam: {
          name: "cluster",
          values: {
            devnet: "devnet",
            testnet: "testnet",
          },
        },
      });

      const mainnetTx = getLink({ transaction: "sig123" });
      expect(mainnetTx).toBe("https://solscan.io/tx/sig123");

      const devnetTx = getLink({
        transaction: "sig123",
        cluster: "devnet",
      });
      expect(devnetTx).toBe("https://solscan.io/tx/sig123?cluster=devnet");

      const address = getLink({ address: "addr456" });
      expect(address).toBe("https://solscan.io/account/addr456");
    });

    it("should work for Solana Explorer-like configuration", () => {
      const getLink = buildGetExplorerLinkFunction({
        baseUrl: "https://explorer.solana.com",
        paths: {
          transaction: "tx",
          address: "address",
          block: "block",
        },
        clusterParam: {
          name: "cluster",
          values: {
            devnet: "devnet",
            testnet: "testnet",
            "mainnet-beta": "mainnet-beta",
          },
        },
      });

      const mainnetTx = getLink({
        transaction: "sig123",
        cluster: "mainnet",
      });
      expect(mainnetTx).toBe("https://explorer.solana.com/tx/sig123");

      const betaTx = getLink({
        transaction: "sig123",
        cluster: "mainnet-beta",
      });
      expect(betaTx).toBe(
        "https://explorer.solana.com/tx/sig123?cluster=mainnet-beta",
      );
    });
  });
});
