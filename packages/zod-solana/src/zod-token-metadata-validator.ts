import type { TokenMetadata } from "./token-metadata-schema.js";
import { tokenMetadataSchema } from "./token-metadata-schema.js";

/**
 * Validates token metadata URI JSON against the full Metaplex schema.
 *
 * Pass this to `fetchTokenInfo`/`fetchTokenInfoForMint` from
 * `@macalinao/gill-extra` (or to `GrillProvider`'s `validateTokenMetadata`) to
 * opt into full schema validation:
 *
 * ```ts
 * import { zodTokenMetadataValidator } from "@macalinao/zod-solana";
 *
 * <GrillProvider validateTokenMetadata={zodTokenMetadataValidator}>
 * ```
 *
 * Doing so pulls zod into your bundle. The default validator in gill-extra is
 * a dependency-free shallow check; prefer it unless you rely on the nested
 * fields (`attributes`, `properties`, `collection`) being validated.
 */
export const zodTokenMetadataValidator = (
  value: unknown,
): TokenMetadata | null => {
  const result = tokenMetadataSchema.safeParse(value);
  return result.success ? result.data : null;
};
