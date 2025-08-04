import type {
  AddressesByLookupTableAddress,
  Instruction,
  TransactionSigner,
} from "@solana/kit";
import {
  address,
  createSolanaRpc,
  getBase58Decoder,
  signAndSendTransactionMessageWithSigners,
  signature,
} from "@solana/kit";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { buildTransactionMessage } from "../utils/transactionMessageBuilder";

export interface SendTXOptions {
  luts?: AddressesByLookupTableAddress;
  signers?: TransactionSigner[];
}

export interface SendTXResult {
  signature: string;
}

export const useSendTX = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useCallback(
    async (
      name: string,
      ixs: readonly Instruction[],
      options: SendTXOptions = {},
    ): Promise<SendTXResult | undefined> => {
      if (!publicKey) {
        toast.error(`${name}: Wallet not connected`);
        return;
      }

      const toastId = toast.loading(`${name}: Preparing transaction...`);

      try {
        // Create RPC client
        const rpc = createSolanaRpc(connection.rpcEndpoint);

        // Get latest blockhash
        const { value: latestBlockhash } = await rpc
          .getLatestBlockhash()
          .send();

        // Build the transaction message
        const transactionMessage = buildTransactionMessage({
          feePayer: address(publicKey.toBase58()),
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          instructions: ixs,
          addressLookupTables: options.luts,
          additionalSigners: options.signers,
        });

        toast.loading(`${name}: Awaiting wallet signature...`, { id: toastId });

        // Send transaction using wallet adapter
        const signatureBytes =
          await signAndSendTransactionMessageWithSigners(transactionMessage);

        // Convert SignatureBytes to string
        const base58Decoder = getBase58Decoder();
        const signatureString = base58Decoder.decode(signatureBytes);
        const sig = signature(signatureString);

        toast.loading(`${name}: Waiting for confirmation...`, { id: toastId });

        // Wait for confirmation
        const confirmationStrategy = {
          signature: sig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        };

        // Poll for transaction confirmation
        let confirmed = false;
        let confirmationError: Error | null = null;
        const maxRetries = 30;
        let retries = 0;

        while (retries < maxRetries) {
          try {
            const signatureStatus = await rpc
              .getSignatureStatuses([sig])
              .send();

            if (signatureStatus.value[0]) {
              const status = signatureStatus.value[0];
              if (
                status.confirmationStatus === "confirmed" ||
                status.confirmationStatus === "finalized"
              ) {
                confirmed = true;
                if (status.err) {
                  confirmationError = new Error("Transaction failed on-chain");
                }
                break;
              }
            }

            // Check if blockhash is still valid
            const blockHeight = await rpc.getBlockHeight().send();
            if (blockHeight > confirmationStrategy.lastValidBlockHeight) {
              throw new Error(
                "Transaction expired - blockhash no longer valid",
              );
            }

            // Wait before next attempt
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
          } catch (error) {
            console.error("Error checking transaction status:", error);
            throw error;
          }
        }

        if (!confirmed) {
          throw new Error("Transaction confirmation timeout");
        }

        if (confirmationError) {
          throw confirmationError;
        }

        // Get transaction details for logging
        const result = await rpc
          .getTransaction(sig, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
            encoding: "jsonParsed",
          })
          .send();

        if (result?.meta?.logMessages) {
          console.log(name, result.meta.logMessages.join("\n"));
        }

        toast.success(`${name}: Confirmed!`, {
          id: toastId,
          duration: 5000,
        });

        return { signature: signatureString };
      } catch (error) {
        console.error(`${name} transaction failed:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Transaction failed.";

        toast.error(`${name}: ${errorMessage}`, {
          id: toastId,
          duration: 5_000,
        });

        throw error;
      }
    },
    [connection, publicKey],
  );
};