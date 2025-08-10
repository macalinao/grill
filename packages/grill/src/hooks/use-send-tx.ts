import { useGrillContext } from "../contexts/grill-context.js";

export type {
  SendTXFunction,
  SendTXOptions,
} from "../utils/internal/create-send-tx.js";

/**
 * Hook that provides a function to send transactions using the modern @solana/kit API
 * while maintaining compatibility with the wallet adapter.
 */
export const useSendTX = () => {
  const { sendTX } = useGrillContext();
  return sendTX;
};
