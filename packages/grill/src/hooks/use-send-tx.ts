import type { SendTXFunction } from "@macalinao/gill-extra";
import { simulateTransactionFactory } from "@macalinao/gill-extra";
import { useGrillContext } from "../contexts/grill-context.js";
import { createSendTX } from "../utils/internal/create-send-tx.js";
import { useKitWallet } from "./use-kit-wallet.js";
import { useSolanaClient } from "./use-solana-client.js";

/**
 * Hook that provides a function to send transactions using the modern @solana/kit API
 * while maintaining compatibility with the wallet adapter.
 *
 * The sending function is built here rather than handed down by
 * `GrillProvider`. Building it in the provider would pull `createSendTX` (and
 * the transaction preparation, simulation, and confirmation code behind it)
 * into every app's bundle, including read-only apps that never send a
 * transaction. Constructing it in the hook keeps that code out of the
 * provider's import graph, so bundlers drop it unless this hook is actually
 * imported.
 *
 * Memoization is left to the React Compiler, which this package is built with.
 */
export const useSendTX = (): SendTXFunction => {
  const { rpc, rpcSubscriptions } = useSolanaClient();
  const { signer } = useKitWallet();
  const {
    refetchAccounts,
    onTransactionStatusEvent,
    getExplorerLink,
    rpcUrl,
    cluster,
    logger,
  } = useGrillContext();

  const simulateTransaction = simulateTransactionFactory({ rpc });
  return createSendTX({
    signer,
    rpc,
    rpcSubscriptions,
    simulateTransaction,
    refetchAccounts,
    onTransactionStatusEvent,
    getExplorerLink,
    rpcUrl,
    cluster,
    logger,
  });
};
