/**
 * Normalizes a token icon URL by replacing known deprecated domains with their working alternatives.
 *
 * Currently handles:
 * - `*.irys.xyz` -> `*.irysnetwork.com` (Irys domain migration)
 *
 * @param url - The icon URL to normalize
 * @returns The normalized URL
 *
 * @example
 * ```ts
 * normalizeIconUrl("https://gateway.irys.xyz/abc123")
 * // Returns: "https://gateway.irysnetwork.com/abc123"
 *
 * normalizeIconUrl("https://node1.irys.xyz/abc123")
 * // Returns: "https://node1.irysnetwork.com/abc123"
 *
 * normalizeIconUrl("https://example.com/icon.png")
 * // Returns: "https://example.com/icon.png" (unchanged)
 * ```
 */
export function normalizeIconUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Check if hostname ends with .irys.xyz
    if (parsed.hostname.endsWith(".irys.xyz")) {
      // Replace .irys.xyz with .irysnetwork.com
      parsed.hostname = parsed.hostname.replace(/\.irys\.xyz$/, ".irysnetwork.com");
      return parsed.toString();
    }

    return url;
  } catch {
    // If URL parsing fails, return original URL unchanged
    return url;
  }
}
