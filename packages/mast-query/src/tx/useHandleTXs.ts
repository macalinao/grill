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
} from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import type { Connection } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";

import type { MastError } from "../errors/index.js";
import {
  MastTransactionSignError,
  MastRefetchAfterTXError,
} from "../errors/index.js";
// import { categorizeTransactionError } from "../errors/index.js"; // Available for advanced error handling
import type { TXHandlers } from "../types.js";

export interface UseHandleTXsArgs {
  rpc: Rpc<
    GetLatestBlockhashApi &
    SendTransactionApi &
    GetSignatureStatusesApi &
    GetTransactionApi
  >;
  onError?: (error: MastError) => void;
  refetchMany: (keys: readonly Address[]) => Promise<void>;
  txHandlers?: TXHandlers;
}

export interface HandleTXOptions {
  signers?: TransactionSigner[];
  addressLookupTables?: AddressesByLookupTableAddress;
}

export interface UseHandleTXs {
  handleTX: (
    name: string,
    instructions: Instruction[],
    options?: HandleTXOptions,
  ) => Promise<string>;
}

export const useHandleTXsInternal = ({
  rpc,
  onError = console.error,
  refetchMany,
  txHandlers = {},
}: UseHandleTXsArgs): UseHandleTXs => {
  const { publicKey, signTransaction, sendTransaction } = useWallet();

  const handleTX = useCallback(
    async (
      name: string,
      instructions: Instruction[],
      _options: HandleTXOptions = {},
    ): Promise<string> => {
      if (!publicKey || !signTransaction) {
        throw new MastTransactionSignError(new Error("Wallet not connected"));
      }

      const { beforeTX, afterTX, onTXSuccess, onTXError } = txHandlers;

      try {
        // Call beforeTX hook
        if (beforeTX) {
          await beforeTX(name);
        }

        // For now, use legacy transaction handling
        // TODO: Update to use @solana/kit once API stabilizes
        const connection = {
          rpcEndpoint: (rpc as any).transport.url,
        } as unknown as Connection;

        // Create legacy transaction
        const transaction = new Transaction();
        
        // Add instructions (convert from @solana/kit format to legacy)
        instructions.forEach((ix: any) => {
          transaction.add({
            programId: ix.programId,
            keys: ix.accounts || [],
            data: ix.data || Buffer.alloc(0),
          } as any);
        });

        // Set fee payer
        transaction.feePayer = publicKey;

        // Get latest blockhash using the legacy connection
        const { blockhash } = await (connection as any).getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        // Send transaction
        const signature = await sendTransaction(transaction, connection as any);

        // Wait for confirmation
        await (connection as any).confirmTransaction(signature);

        // Call success hooks
        if (onTXSuccess) {
          await onTXSuccess(name, signature);
        }

        // Refetch affected accounts
        const affectedAddresses = new Set<Address>();
        instructions.forEach((ix: any) => {
          if (ix.accounts) {
            ix.accounts.forEach((account: any) => {
              if (account.pubkey) {
                affectedAddresses.add(address(account.pubkey.toBase58()));
              }
            });
          }
        });

        if (affectedAddresses.size > 0) {
          try {
            await refetchMany([...affectedAddresses]);
          } catch (refetchError) {
            throw new MastRefetchAfterTXError(refetchError);
          }
        }

        // Call afterTX hook
        if (afterTX) {
          await afterTX(name, signature);
        }

        return signature;
      } catch (error) {
        // categorizeTransactionError(error); // Can be used for more specific error handling
        const mastError = new MastTransactionSignError(error);
        
        // Call error hook
        if (onTXError) {
          await onTXError(name, mastError);
        }

        onError(mastError);
        throw mastError;
      }
    },
    [publicKey, signTransaction, sendTransaction, rpc, refetchMany, txHandlers, onError],
  );

  return { handleTX };
};