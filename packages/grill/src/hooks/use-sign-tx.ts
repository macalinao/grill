import type { SignTXFunction } from "@macalinao/gill-extra";
import { useGrillContext } from "../contexts/grill-context.js";

/**
 * Hook that provides a function to sign a transaction without sending it,
 * returning the signed transaction. Only usable when the connected wallet
 * supports signing without sending; otherwise the returned promise rejects.
 */
export const useSignTX = (): SignTXFunction => {
  const { signTX } = useGrillContext();
  return signTX;
};
