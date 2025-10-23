import type { TokenInfo } from "./types.js";
import { address } from "@solana/kit";

/**
 * TokenInfo for native SOL
 */
export const NATIVE_SOL: TokenInfo<"11111111111111111111111111111111", 9> = {
  mint: address("11111111111111111111111111111111"),
  name: "Solana",
  symbol: "SOL",
  decimals: 9,
  // TODO(igm): icons should be put in some sort of static repository, and they should be SVGs.
  iconURL: "https://grill.ianm.com/tokens/sol.svg",
};
