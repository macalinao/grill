import type { PdaFn, PdaHook, PdasHook } from "@macalinao/grill";
import type { Address } from "@solana/kit";
import {
  createPdaHook,
  createPdasHook,
  TOKEN_METADATA_PROGRAM_ADDRESS,
} from "@macalinao/grill";
import {
  getAddressEncoder,
  getProgramDerivedAddress,
  getUtf8Encoder,
} from "@solana/kit";

export interface MasterEditionSeeds {
  mint: Address;
}

const addressEncoder = getAddressEncoder();
const utf8Encoder = getUtf8Encoder();

/**
 * The Metaplex Master Edition PDA: ["metadata", <program>, <mint>, "edition"].
 *
 * A `PdaFn` is just an async function from seeds to `[address, bump]` — anything
 * with that shape can be turned into a hook.
 */
export const findMasterEditionPda: PdaFn<MasterEditionSeeds, Address> = ({
  mint,
}) =>
  getProgramDerivedAddress({
    programAddress: TOKEN_METADATA_PROGRAM_ADDRESS,
    seeds: [
      utf8Encoder.encode("metadata"),
      addressEncoder.encode(TOKEN_METADATA_PROGRAM_ADDRESS),
      addressEncoder.encode(mint),
      utf8Encoder.encode("edition"),
    ],
  });

/**
 * Hooks built from `findMasterEditionPda`. PDA derivation is async and
 * deterministic, so the factories cache each result in react-query forever and
 * hand components back a plain synchronous value.
 */
export const useMasterEditionPda: PdaHook<MasterEditionSeeds> = createPdaHook(
  findMasterEditionPda,
  "masterEditionPda",
);

export const useMasterEditionPdas: PdasHook<MasterEditionSeeds> =
  createPdasHook(findMasterEditionPda, "masterEditionPdas");
