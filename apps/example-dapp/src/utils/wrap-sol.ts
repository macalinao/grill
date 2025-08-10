import type { TransactionSendingSigner } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
// Import token program functions from @solana-program/token
import {
  findAssociatedTokenPda,
  getCloseAccountInstruction,
  getCreateAssociatedTokenIdempotentInstruction,
  getSyncNativeInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { address } from "gill";

// Native mint (wSOL) address
export const WSOL_MINT = address("So11111111111111111111111111111111111111112");

// Re-export for convenience
export { WSOL_MINT as NATIVE_MINT };

/**
 * Creates instructions to wrap SOL into wSOL
 * This creates an idempotent associated token account for wSOL and transfers SOL to it
 */
export async function getWrapSOLInstructions(
  signer: TransactionSendingSigner,
  amount: bigint,
) {
  const owner = signer.address;

  // Get the associated token account address for wSOL
  const ataPda = await findAssociatedTokenPda({
    mint: WSOL_MINT,
    owner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  const ataAddress = ataPda[0];

  const instructions = [];

  // Create ATA instruction (idempotent - won't fail if it already exists)
  const createAtaInstruction = getCreateAssociatedTokenIdempotentInstruction({
    payer: signer,
    ata: ataAddress,
    owner,
    mint: WSOL_MINT,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  instructions.push(createAtaInstruction);

  // Transfer SOL to the account (this becomes wSOL)
  const transferInstruction = getTransferSolInstruction({
    source: signer,
    destination: ataAddress,
    amount,
  });

  instructions.push(transferInstruction);

  // Sync native instruction to update the token balance
  const syncNativeInstruction = getSyncNativeInstruction({
    account: ataAddress,
  });

  instructions.push(syncNativeInstruction);

  return instructions;
}

/**
 * Creates instructions to unwrap wSOL back to SOL
 * This closes the wSOL token account and returns the SOL
 */
export async function getUnwrapSOLInstructions(
  signer: TransactionSendingSigner,
) {
  const owner = signer.address;

  // Get the associated token account address for wSOL
  const ataPda = await findAssociatedTokenPda({
    mint: WSOL_MINT,
    owner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  const ataAddress = ataPda[0];

  // Close account instruction - this returns all SOL to the owner
  const closeAccountInstruction = getCloseAccountInstruction({
    account: ataAddress,
    destination: owner,
    owner: signer,
  });

  return [closeAccountInstruction];
}
