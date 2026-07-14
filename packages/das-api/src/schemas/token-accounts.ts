import type {
  DasApiTokenAccount,
  GetTokenAccountsResponse,
} from "../types/token-accounts.js";
import { addressSchema } from "@macalinao/zod-solana";
import * as z from "zod";
import { jsonValueSchema } from "./json-value.js";

/**
 * Zod schema for a {@link DasApiTokenAccount}.
 */
export const dasApiTokenAccountSchema: z.ZodType<DasApiTokenAccount> =
  z.looseObject({
    address: addressSchema,
    mint: addressSchema,
    owner: addressSchema,
    amount: z.number(),
    delegated_amount: z.number().optional(),
    frozen: z.boolean(),
    delegate: addressSchema.nullish(),
    close_authority: addressSchema.nullish(),
    token_extensions: z.record(z.string(), jsonValueSchema).optional(),
  });

/**
 * Zod schema for a {@link GetTokenAccountsResponse}.
 */
export const getTokenAccountsResponseSchema: z.ZodType<GetTokenAccountsResponse> =
  z.looseObject({
    total: z.number(),
    limit: z.number(),
    page: z.number().optional(),
    cursor: z.string().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    token_accounts: z.array(dasApiTokenAccountSchema),
  });
