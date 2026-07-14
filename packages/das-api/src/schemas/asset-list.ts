import type {
  DasApiAssetList,
  DasApiNativeBalance,
} from "../types/asset-list.js";
import * as z from "zod";
import { dasApiAssetSchema } from "./asset.js";

/**
 * Zod schema for a {@link DasApiNativeBalance}.
 */
export const dasApiNativeBalanceSchema: z.ZodType<DasApiNativeBalance> =
  z.looseObject({
    lamports: z.number(),
    price_per_sol: z.number().optional(),
    total_price: z.number().optional(),
  });

/**
 * Zod schema for a {@link DasApiAssetList}, the response of the list/search
 * style methods (`getAssetsByOwner`, `searchAssets`, ...).
 */
export const dasApiAssetListSchema: z.ZodType<DasApiAssetList> = z.looseObject({
  total: z.number(),
  limit: z.number(),
  page: z.number().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  cursor: z.string().optional(),
  items: z.array(dasApiAssetSchema),
  nativeBalance: dasApiNativeBalanceSchema.optional(),
  grand_total: z.number().optional(),
});
