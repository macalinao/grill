import type { Address } from "@solana/kit";

export const accountQueryKey = (address: Address) =>
  ["mast/account", address] as const;
