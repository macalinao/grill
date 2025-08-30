import { describe, expect, it } from "bun:test";
import { getSolscanExplorerLink } from "./get-solscan-explorer-link.js";

describe("getSolscanExplorerLink", () => {
  describe("transactions", () => {
    it("should generate mainnet transaction link", () => {
      const signature = "5xY7Zq9sFpX8kLnqfRKdKz7hFjDhJpgK3xvMqQJqLxLz";
      const link = getSolscanExplorerLink({ transaction: signature });
      expect(link).toBe(`https://solscan.io/tx/${signature}`);
    });

    it("should generate mainnet-beta transaction link", () => {
      const signature = "5xY7Zq9sFpX8kLnqfRKdKz7hFjDhJpgK3xvMqQJqLxLz";
      const link = getSolscanExplorerLink({
        transaction: signature,
        cluster: "mainnet-beta",
      });
      expect(link).toBe(`https://solscan.io/tx/${signature}`);
    });

    it("should generate devnet transaction link", () => {
      const signature = "5xY7Zq9sFpX8kLnqfRKdKz7hFjDhJpgK3xvMqQJqLxLz";
      const link = getSolscanExplorerLink({
        transaction: signature,
        cluster: "devnet",
      });
      expect(link).toBe(`https://solscan.io/tx/${signature}?cluster=devnet`);
    });

    it("should generate testnet transaction link", () => {
      const signature = "5xY7Zq9sFpX8kLnqfRKdKz7hFjDhJpgK3xvMqQJqLxLz";
      const link = getSolscanExplorerLink({
        transaction: signature,
        cluster: "testnet",
      });
      expect(link).toBe(`https://solscan.io/tx/${signature}?cluster=testnet`);
    });
  });

  describe("addresses", () => {
    it("should generate mainnet address link", () => {
      const address = "11111111111111111111111111111111";
      const link = getSolscanExplorerLink({ address });
      expect(link).toBe(`https://solscan.io/account/${address}`);
    });

    it("should generate mainnet-beta address link", () => {
      const address = "11111111111111111111111111111111";
      const link = getSolscanExplorerLink({
        address,
        cluster: "mainnet-beta",
      });
      expect(link).toBe(`https://solscan.io/account/${address}`);
    });

    it("should generate devnet address link", () => {
      const address = "11111111111111111111111111111111";
      const link = getSolscanExplorerLink({
        address,
        cluster: "devnet",
      });
      expect(link).toBe(`https://solscan.io/account/${address}?cluster=devnet`);
    });

    it("should generate testnet address link", () => {
      const address = "11111111111111111111111111111111";
      const link = getSolscanExplorerLink({
        address,
        cluster: "testnet",
      });
      expect(link).toBe(
        `https://solscan.io/account/${address}?cluster=testnet`,
      );
    });
  });

  describe("blocks", () => {
    it("should generate mainnet block link with number", () => {
      const block = 123456789;
      const link = getSolscanExplorerLink({ block });
      expect(link).toBe(`https://solscan.io/block/${String(block)}`);
    });

    it("should generate mainnet block link with string", () => {
      const block = "123456789";
      const link = getSolscanExplorerLink({ block });
      expect(link).toBe(`https://solscan.io/block/${block}`);
    });

    it("should generate devnet block link", () => {
      const block = 123456789;
      const link = getSolscanExplorerLink({
        block,
        cluster: "devnet",
      });
      expect(link).toBe(
        `https://solscan.io/block/${String(block)}?cluster=devnet`,
      );
    });

    it("should generate testnet block link", () => {
      const block = "123456789";
      const link = getSolscanExplorerLink({
        block,
        cluster: "testnet",
      });
      expect(link).toBe(`https://solscan.io/block/${block}?cluster=testnet`);
    });
  });

  describe("default behavior", () => {
    it("should return base URL when no arguments provided", () => {
      const link = getSolscanExplorerLink();
      expect(link).toBe("https://solscan.io/");
    });

    it("should return base URL when empty object provided", () => {
      const link = getSolscanExplorerLink({});
      expect(link).toBe("https://solscan.io/");
    });
  });

  describe("special characters", () => {
    it("should handle transaction signatures with special characters", () => {
      const signature = "5xY7Zq9sFpX8+kLnqfRKdKz7hFjDhJpgK3xvMqQJqLxLz";
      const link = getSolscanExplorerLink({ transaction: signature });
      // URL constructor should handle encoding automatically
      expect(link).toBe(`https://solscan.io/tx/${signature}`);
    });

    it("should handle addresses with special characters", () => {
      const address = "Token+Program/111111111111111111111111";
      const link = getSolscanExplorerLink({ address });
      // URL constructor should handle encoding automatically
      expect(link).toBe(`https://solscan.io/account/${address}`);
    });
  });

  describe("URL encoding", () => {
    it("should properly encode query parameters", () => {
      const signature = "test";
      const link = getSolscanExplorerLink({
        transaction: signature,
        cluster: "devnet",
      });
      const url = new URL(link);
      expect(url.searchParams.get("cluster")).toBe("devnet");
    });

    it("should not add cluster parameter for mainnet", () => {
      const signature = "test";
      const link = getSolscanExplorerLink({
        transaction: signature,
        cluster: "mainnet",
      });
      const url = new URL(link);
      expect(url.searchParams.has("cluster")).toBe(false);
    });
  });
});
