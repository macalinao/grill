import type { Signature, SignatureBytes } from "@solana/kit";
import { getBase58Decoder } from "@solana/kit";

/**
 * Converts signature bytes to a Signature string.
 * @param sigBytes - The signature bytes to convert
 * @returns The base58-encoded signature string
 */
export function getSignatureFromBytes(sigBytes: SignatureBytes): Signature {
  const decoder = getBase58Decoder();
  const sig = decoder.decode(sigBytes) as Signature;
  return sig;
}
