import type {
  Account,
  Decoder,
  Rpc,
  SimulateTransactionApi,
} from "@solana/kit";
import type { Address } from "gill";
import {
  decodeAccount,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  partiallySignTransactionMessageWithSigners,
} from "@solana/kit";

type DecoderTuple<T = object> = readonly [Address, Decoder<T>];

interface SimulateTransactionWithAccountsParams<
  TAccounts extends readonly [...DecoderTuple[]],
> {
  transactionMessage: Parameters<
    typeof partiallySignTransactionMessageWithSigners
  >[0];
  rpc: Rpc<SimulateTransactionApi>;
  accountsToFetch: TAccounts;
}

type TSimulateReturn<TAccounts extends readonly [...DecoderTuple[]]> = {
  [K in keyof TAccounts]: TAccounts[K] extends readonly [
    infer TAddress extends Address,
    Decoder<infer T extends object>,
  ]
    ? Account<T, TAddress> | null
    : never;
};

/**
 * Simulates a transaction and returns decoded accounts
 * @param params Object containing transaction message, RPC client, and accounts to fetch
 * @returns Tuple of decoded accounts in the same order as accountsToFetch
 */
export async function simulateTransactionWithAccounts<
  TAccounts extends readonly [...DecoderTuple[]],
>(
  params: SimulateTransactionWithAccountsParams<TAccounts>,
): Promise<TSimulateReturn<TAccounts>> {
  const { transactionMessage, rpc, accountsToFetch } = params;

  // Partially sign the transaction for simulation
  const tx =
    await partiallySignTransactionMessageWithSigners(transactionMessage);

  // Extract addresses from the tuples
  const addresses = accountsToFetch.map(([address]) => address);

  // Simulate the transaction
  const simResult = await rpc
    .simulateTransaction(getBase64EncodedWireTransaction(tx), {
      replaceRecentBlockhash: true,
      sigVerify: false,
      encoding: "base64",
      innerInstructions: true,
      accounts: {
        addresses,
        encoding: "base64",
      },
    })
    .send();

  // Check for simulation errors
  const simError = simResult.value.err;
  if (simError) {
    log.error("Error simulating transaction");
    throw new Error("Transaction simulation failed");
  }

  // Decode each account
  return accountsToFetch.map((item, index): Account<object> | null => {
    const [address, decoder] = item;

    const account = simResult.value.accounts[index];
    if (!account) {
      return null;
    }

    const base64Data = account.data[0];
    const bytes = getBase64Encoder().encode(base64Data);
    return decodeAccount(
      {
        address,
        data: bytes,
        executable: account.executable,
        lamports: account.lamports,
        programAddress: account.owner,
        space: account.space,
      },
      decoder,
    );
  }) as TSimulateReturn<TAccounts>;
}
