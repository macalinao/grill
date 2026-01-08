import { describe, expect, it } from "bun:test";
import { normalizeIconUrl } from "./normalize-icon-url.js";

describe("normalizeIconUrl", () => {
  describe("irys.xyz to irysnetwork.com migration", () => {
    it("should replace gateway.irys.xyz with gateway.irysnetwork.com", () => {
      const result = normalizeIconUrl("https://gateway.irys.xyz/abc123");
      expect(result).toBe("https://gateway.irysnetwork.com/abc123");
    });

    it("should handle http protocol", () => {
      const result = normalizeIconUrl("http://gateway.irys.xyz/token/icon.png");
      expect(result).toBe("http://gateway.irysnetwork.com/token/icon.png");
    });

    it("should preserve path and query parameters", () => {
      const result = normalizeIconUrl(
        "https://gateway.irys.xyz/path/to/image.png?foo=bar&baz=123"
      );
      expect(result).toBe(
        "https://gateway.irysnetwork.com/path/to/image.png?foo=bar&baz=123"
      );
    });

    it("should handle URLs with fragments", () => {
      const result = normalizeIconUrl(
        "https://gateway.irys.xyz/image.png#section"
      );
      expect(result).toBe("https://gateway.irysnetwork.com/image.png#section");
    });

    it("should handle root path", () => {
      const result = normalizeIconUrl("https://gateway.irys.xyz/");
      expect(result).toBe("https://gateway.irysnetwork.com/");
    });

    it("should handle no trailing path", () => {
      const result = normalizeIconUrl("https://gateway.irys.xyz");
      // URL class normalizes by adding trailing slash
      expect(result).toBe("https://gateway.irysnetwork.com/");
    });
  });

  describe("non-irys URLs", () => {
    it("should not modify other URLs", () => {
      const url = "https://example.com/icon.png";
      expect(normalizeIconUrl(url)).toBe(url);
    });

    it("should not modify arweave URLs", () => {
      const url = "https://arweave.net/abc123";
      expect(normalizeIconUrl(url)).toBe(url);
    });

    it("should not modify ipfs URLs", () => {
      const url = "https://ipfs.io/ipfs/Qm123abc";
      expect(normalizeIconUrl(url)).toBe(url);
    });

    it("should not modify data URIs", () => {
      const url = "data:image/svg+xml,<svg></svg>";
      expect(normalizeIconUrl(url)).toBe(url);
    });

    it("should handle other irys subdomains", () => {
      const result = normalizeIconUrl("https://node1.irys.xyz/abc123");
      expect(result).toBe("https://node1.irysnetwork.com/abc123");
    });

    it("should not modify irys.xyz in path", () => {
      const url = "https://example.com/gateway.irys.xyz/icon.png";
      expect(normalizeIconUrl(url)).toBe(url);
    });
  });
});
