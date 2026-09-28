import type { SignTXFunction } from "@macalinao/gill-extra";
import { simulateTransactionFactory } from "@macalinao/gill-extra";
import { useGrillContext } from "../contexts/grill-context.js";
import { createSignTX } from "../utils/internal/create-sign-tx.js";
import { useKitWallet } from "./use-kit-wallet.js";
import { useSolanaClient } from "./use-solana-client.js";

/**
 * Hook that provides a function to sign a transaction without sending it,
 * returning the signed transaction. Only usable when the connected wallet
 * supports signing without sending; otherwise the returned promise rejects.
 *
 * Like {@link useSendTX}, the signing function is built here rather than
 * handed down by `GrillProvider`. Signing without sending is a niche capability,
 * and building it in the provider would pull `createSignTX` into every app's
 * bundle. Constructing it in the hook keeps the code out of the provider's
 * import graph, so bundlers drop it unless this hook is actually imported.
 *
 * Memoization is left to the React Compiler, which this package is built with.
 */
export const useSignTX = (): SignTXFunction => {
  const { rpc } = useSolanaClient();
  const { signer } = useKitWallet();
  const { onTransactionStatusEvent, rpcUrl, cluster, logger } =
    useGrillContext();

  const simulateTransaction = simulateTransactionFactory({ rpc });
  return createSignTX({
    signer,
    rpc,
    simulateTransaction,
    onTransactionStatusEvent,
    rpcUrl,
    cluster,
    logger,
  });
};
