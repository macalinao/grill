import type { Token } from "@solana-program/token";
import { getTokenDecoder } from "@solana-program/token";
import { createDecodedAccountHook } from "./create-decoded-account-hook.js";

// Create the base hook using the generic helper
export const useTokenAccount = createDecodedAccountHook<Token>(
  getTokenDecoder(),
);
