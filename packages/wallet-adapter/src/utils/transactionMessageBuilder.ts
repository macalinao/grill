import type {
  Address,
  AddressesByLookupTableAddress,
  Blockhash,
  Instruction,
  TransactionMessageWithBlockhashLifetime,
} from "@solana/kit";
import {
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";

import type { WalletTransactionSigner } from "../signers/walletTransactionSigner.js";

export interface BuildTransactionMessageOptions {
  feePayer: Address;
  blockhash: Blockhash;
  lastValidBlockHeight: bigint;
  instructions: readonly Instruction[];
  addressLookupTables?: AddressesByLookupTableAddress;
  additionalSigners?: WalletTransactionSigner[];
}

export async function buildTransactionMessage({
  feePayer,
  blockhash,
  lastValidBlockHeight,
  instructions,
  additionalSigners,
}: BuildTransactionMessageOptions): Promise<TransactionMessageWithBlockhashLifetime> {
  // Create transaction message with instructions
  let message = createTransactionMessage({ version: 0 });

  // Add instructions
  message = {
    ...message,
    instructions: [...instructions],
  } as any;

  // Set fee payer
  message = setTransactionMessageFeePayer(feePayer, message);

  // Set lifetime
  message = setTransactionMessageLifetimeUsingBlockhash(
    { blockhash, lastValidBlockHeight },
    message,
  );

  // Sign with additional signers if provided
  if (additionalSigners && additionalSigners.length > 0) {
    // TODO: Implement signing with WalletTransactionSigner when @solana/kit API stabilizes
    // For now, return unsigned message
  }

  return message as unknown as TransactionMessageWithBlockhashLifetime;
}
