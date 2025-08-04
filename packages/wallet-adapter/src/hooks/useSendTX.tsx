import type {
  AddressesByLookupTableAddress,
  Instruction,
} from "@solana/kit";
import {
  createSolanaRpc,
} from "@solana/kit";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { toast } from "sonner";

import type { WalletTransactionSigner } from "../signers/walletTransactionSigner.js";

export interface SendTXOptions {
  luts?: AddressesByLookupTableAddress;
  signers?: WalletTransactionSigner[];
}

export interface SendTXResult {
  signature: string;
}

export const useSendTX = (): {
  sendTX: (
    ixs: Instruction[],
    options?: SendTXOptions,
  ) => Promise<SendTXResult>;
} => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const sendTX = useCallback(
    async (
      ixs: Instruction[],
      _options: SendTXOptions = {},
    ): Promise<SendTXResult> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const toastId = toast.loading("Preparing transaction...");

      try {
        // Create RPC client
        const rpc = createSolanaRpc(connection.rpcEndpoint);

        // Get latest blockhash
        const { value: latestBlockhash } = await rpc
          .getLatestBlockhash()
          .send();

        toast.loading("Awaiting wallet signature...", { id: toastId });

        // For now, we'll use the legacy sendTransaction method
        // TODO: Update to use @solana/kit transaction signing once API stabilizes
        const legacyTransaction = {
          feePayer: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: ixs.map((ix: any) => ({
            programId: ix.programId,
            keys: ix.accounts || [],
            data: ix.data || Buffer.alloc(0),
          })),
        } as any;

        const signatureString = await sendTransaction(
          legacyTransaction,
          connection,
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          },
        );

        toast.loading("Waiting for confirmation...", { id: toastId });

        // Wait for confirmation - convert bigint to number
        const confirmation = await connection.confirmTransaction({
          signature: signatureString,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: Number(latestBlockhash.lastValidBlockHeight),
        });

        if (confirmation.value.err) {
          throw new Error("Transaction failed");
        }

        toast.success("Transaction confirmed!", { id: toastId });

        return { signature: signatureString };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Transaction failed: ${message}`, { id: toastId });
        throw error;
      }
    },
    [publicKey, sendTransaction, connection],
  );

  return { sendTX };
};