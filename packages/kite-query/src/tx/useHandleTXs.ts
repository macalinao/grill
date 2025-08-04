import type {
  Address,
  AddressesByLookupTableAddress,
  GetLatestBlockhashApi,
  GetSignatureStatusesApi,
  GetTransactionApi,
  Instruction,
  Rpc,
  SendTransactionApi,
  TransactionSigner,
} from "@solana/kit";
import {
  address,
  createSolanaRpc,
  getBase58Decoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signature,
  signTransactionMessageWithSigners,
  transactionMessage,
} from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import retry from "retry";

import type { KiteError } from "../errors";
import {
  KiteSignAndConfirmError,
  KiteTransactionSignError,
  KiteUnknownTXFailError,
  KiteRefetchAfterTXError,
} from "../errors";
import { categorizeTransactionError } from "../errors";
import type { TXHandlers } from "../types";

export interface UseHandleTXsArgs {
  rpc: Rpc<
    GetLatestBlockhashApi &
    SendTransactionApi &
    GetSignatureStatusesApi &
    GetTransactionApi
  >;
  onError?: (error: KiteError) => void;
  refetchMany: (keys: readonly Address[]) => Promise<void>;
  txHandlers?: TXHandlers;
}

export interface HandleTXOptions {
  signers?: TransactionSigner[];
  addressLookupTables?: AddressesByLookupTableAddress;
  computeUnitPrice?: bigint;
}

export interface HandleTXResponse {
  signature: string;
}

export interface HandleTXsResponse {
  signatures: string[];
}

export interface UseHandleTXs {
  sendTX: (
    instructions: readonly Instruction[],
    options?: HandleTXOptions,
  ) => Promise<HandleTXResponse>;
  sendTXs: (
    instructionGroups: readonly (readonly Instruction[])[],
    options?: HandleTXOptions,
  ) => Promise<HandleTXsResponse>;
}

export const useHandleTXsInternal = ({
  rpc,
  onError = console.error,
  refetchMany,
  txHandlers,
}: UseHandleTXsArgs): UseHandleTXs => {
  const { publicKey, signTransaction } = useWallet();

  const sendTX = useCallback(
    async (
      instructions: readonly Instruction[],
      options: HandleTXOptions = {},
    ): Promise<HandleTXResponse> => {
      if (!publicKey || !signTransaction) {
        throw new KiteTransactionSignError("Wallet not connected");
      }

      const decoder = getBase58Decoder();

      try {
        // Get latest blockhash
        const { value: latestBlockhash } = await rpc
          .getLatestBlockhash()
          .send();

        // Build transaction message
        const message = pipe(
          transactionMessage({ version: 0 }),
          (tx) => {
            instructions.forEach((ix) => {
              tx.instructions.push(ix);
            });
            return tx;
          },
          (tx) => setTransactionMessageFeePayer(address(publicKey.toBase58()), tx),
          (tx) => setTransactionMessageLifetimeUsingBlockhash(
            {
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            tx,
          ),
        );

        // Add address lookup tables if provided
        if (options.addressLookupTables) {
          Object.entries(options.addressLookupTables).forEach(([tableAddress, addresses]) => {
            message.addressTableLookups.push({
              lookupTableAddress: address(tableAddress),
              readableIndices: [],
              writableIndices: addresses.map((_, i) => i),
            });
          });
        }

        // Sign with additional signers if provided
        let signedMessage = message;
        if (options.signers && options.signers.length > 0) {
          signedMessage = await signTransactionMessageWithSigners(
            options.signers,
            message,
          );
        }

        // Sign with wallet
        const signedTx = await signTransaction({
          message: signedMessage,
          signers: options.signers || [],
        });

        // Send transaction
        const signatureBytes = await rpc
          .sendTransaction(signedTx, {
            skipPreflight: false,
            maxRetries: 3,
          })
          .send();

        const signatureString = decoder.decode(signatureBytes);
        const sig = signature(signatureString);

        // Wait for confirmation with retries
        const operation = retry.operation({
          retries: 30,
          factor: 1,
          minTimeout: 1000,
          maxTimeout: 1000,
        });

        await new Promise<void>((resolve, reject) => {
          operation.attempt(async () => {
            try {
              const status = await rpc
                .getSignatureStatuses([sig])
                .send();

              if (status.value[0]) {
                const txStatus = status.value[0];
                if (
                  txStatus.confirmationStatus === "confirmed" ||
                  txStatus.confirmationStatus === "finalized"
                ) {
                  if (txStatus.err) {
                    reject(new KiteUnknownTXFailError(signatureString, txStatus.err));
                  } else {
                    resolve();
                  }
                  return;
                }
              }

              // Check if blockhash is still valid
              const blockHeight = await rpc.getBlockHeight().send();
              if (blockHeight > latestBlockhash.lastValidBlockHeight) {
                reject(new Error("Transaction expired"));
                return;
              }

              // Retry
              if (!operation.retry(new Error("Not confirmed yet"))) {
                reject(operation.mainError());
              }
            } catch (error) {
              if (!operation.retry(error as Error)) {
                reject(error);
              }
            }
          });
        });

        // Refetch affected accounts
        const writableAccounts = message.instructions.flatMap((ix) =>
          ix.accounts?.filter((acc) => acc.role === "writable").map((acc) => acc.address) || []
        );
        
        if (writableAccounts.length > 0) {
          try {
            await refetchMany(writableAccounts);
          } catch (error) {
            onError(new KiteRefetchAfterTXError(error));
          }
        }

        // Call success handler if provided
        if (txHandlers?.onTXSuccess) {
          await txHandlers.onTXSuccess(signatureString);
        }

        return { signature: signatureString };
      } catch (error) {
        const categorized = categorizeTransactionError(error);
        const kiteError = new KiteSignAndConfirmError(categorized.originalError);
        onError(kiteError);
        throw kiteError;
      }
    },
    [publicKey, signTransaction, rpc, refetchMany, txHandlers, onError],
  );

  const sendTXs = useCallback(
    async (
      instructionGroups: readonly (readonly Instruction[])[],
      options: HandleTXOptions = {},
    ): Promise<HandleTXsResponse> => {
      const signatures: string[] = [];
      
      for (const instructions of instructionGroups) {
        const result = await sendTX(instructions, options);
        signatures.push(result.signature);
      }

      return { signatures };
    },
    [sendTX],
  );

  return {
    sendTX,
    sendTXs,
  };
};