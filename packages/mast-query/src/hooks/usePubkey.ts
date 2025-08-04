import type { Address } from "@solana/kit";
import { address } from "@solana/kit";
import { useMemo } from "react";

export const usePubkey = (
  key: string | Address | null | undefined,
): Address | null => {
  return useMemo(() => {
    if (!key) return null;
    try {
      return address(key);
    } catch {
      return null;
    }
  }, [key]);
};