import type { SendTXFunction } from "@macalinao/gill-extra";
import { useGrillContext } from "../contexts/grill-context.js";

/**
 * Hook that provides a function to send transactions using the modern @solana/kit API
 * while maintaining compatibility with the wallet adapter.
 */
export const useSendTX = (): SendTXFunction => {
  const { sendTX } = useGrillContext();
  return sendTX;
};
