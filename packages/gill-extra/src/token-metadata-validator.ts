import type { TokenMetadata } from "@macalinao/zod-solana";

/**
 * Validates the JSON served from a token's metadata URI.
 *
 * Returning `null` means the payload was not usable token metadata; the caller
 * falls back to the on-chain metadata account.
 *
 * This is the seam that keeps zod out of the default bundle. The type is
 * structural, so any function of this shape works — see
 * {@link defaultTokenMetadataValidator} for the zero-dependency default, or
 * `zodTokenMetadataValidator` from `@macalinao/zod-solana` for full schema
 * validation.
 */
export type TokenMetadataValidator = (value: unknown) => TokenMetadata | null;

const optionalString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

/**
 * The default {@link TokenMetadataValidator}: a shallow structural check with no
 * dependencies.
 *
 * It requires `name` and `symbol` to be strings and passes through the
 * well-known optional string fields. Nested fields (`attributes`,
 * `properties`, `collection`) and `seller_fee_basis_points` are *not* validated
 * and are omitted from the result — if you need them, supply
 * `zodTokenMetadataValidator` from `@macalinao/zod-solana` instead, which
 * validates the full Metaplex schema at the cost of pulling zod into your
 * bundle.
 */
export const defaultTokenMetadataValidator: TokenMetadataValidator = (
  value,
) => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const {
    name,
    symbol,
    description,
    image,
    animation_url: animationUrl,
    external_url: externalUrl,
  } = value as Record<string, unknown>;

  if (typeof name !== "string" || typeof symbol !== "string") {
    return null;
  }

  return {
    name,
    symbol,
    description: optionalString(description),
    image: optionalString(image),
    animation_url: optionalString(animationUrl),
    external_url: optionalString(externalUrl),
  };
};
