import type {
  DasApiNftEdition,
  GetNftEditionsResponse,
} from "../types/nft-editions.js";
import { addressSchema } from "@macalinao/zod-solana";
import * as z from "zod";

/**
 * Zod schema for a {@link DasApiNftEdition}.
 */
export const dasApiNftEditionSchema: z.ZodType<DasApiNftEdition> =
  z.looseObject({
    mint: addressSchema,
    edition_address: addressSchema,
    edition: z.number(),
  });

/**
 * Zod schema for a {@link GetNftEditionsResponse}.
 */
export const getNftEditionsResponseSchema: z.ZodType<GetNftEditionsResponse> =
  z.looseObject({
    total: z.number(),
    limit: z.number(),
    page: z.number().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    master_edition_address: addressSchema,
    supply: z.number(),
    max_supply: z.number().optional(),
    editions: z.array(dasApiNftEditionSchema),
  });
