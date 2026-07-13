import type { Mock } from "bun:test";
import type { SignatureBytes, Transaction } from "@solana/kit";
import type {
  PrivySignAndSendTransactionFn,
  PrivySolanaWallet,
} from "./types.js";
import { describe, expect, mock, test } from "bun:test";
import {
  address,
  blockhash,
  compileTransaction,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { createPrivyTransactionSendingSigner } from "./create-privy-transaction-sending-signer.js";
import { expectRejection } from "./test-setup.js";

const WALLET_ADDRESS = "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrq";
const wallet: PrivySolanaWallet = { address: WALLET_ADDRESS };

const signature = (fill: number): SignatureBytes =>
  new Uint8Array(64).fill(fill) as SignatureBytes;

/**
 * Compiles a transaction whose fee payer is the given address, so that each
 * transaction in a test serializes to distinct bytes.
 */
const createTransaction = (feePayer: string = WALLET_ADDRESS): Transaction =>
  pipe(
    createTransactionMessage({ version: 0 }),
    (message) => setTransactionMessageFeePayer(address(feePayer), message),
    (message) =>
      setTransactionMessageLifetimeUsingBlockhash(
        {
          blockhash: blockhash("11111111111111111111111111111111"),
          lastValidBlockHeight: 100n,
        },
        message,
      ),
    (message) => compileTransaction(message),
  );

const succeedWith = (result: Uint8Array): Mock<PrivySignAndSendTransactionFn> =>
  mock(() => Promise.resolve({ signature: result }));

describe("createPrivyTransactionSendingSigner", () => {
  test("exposes the Privy wallet address as its Kit address", () => {
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction: succeedWith(signature(1)),
    });

    expect(signer.address).toBe(address(WALLET_ADDRESS));
  });

  test("rejects a wallet whose address is not a valid Solana address", () => {
    expect(() =>
      createPrivyTransactionSendingSigner({
        wallet: { address: "not-a-real-address" },
        signAndSendTransaction: succeedWith(signature(1)),
      }),
    ).toThrow();
  });

  test("sends the serialized wire transaction to Privy", async () => {
    const signAndSendTransaction = succeedWith(signature(1));
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
    });
    const transaction = createTransaction();

    await signer.signAndSendTransactions([transaction]);

    const input = signAndSendTransaction.mock.calls[0]?.[0];
    expect(input?.transaction).toEqual(
      Uint8Array.from(getTransactionEncoder().encode(transaction)),
    );
    expect(input?.wallet).toBe(wallet);
  });

  test("defaults to mainnet and sends no options", async () => {
    const signAndSendTransaction = succeedWith(signature(1));
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
    });

    await signer.signAndSendTransactions([createTransaction()]);

    const input = signAndSendTransaction.mock.calls[0]?.[0];
    expect(input?.chain).toBe("solana:mainnet");
    expect(input && "options" in input).toBe(false);
  });

  test("forwards the chain and the Privy options", async () => {
    const signAndSendTransaction = succeedWith(signature(1));
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
      chain: "solana:devnet",
      options: { skipPreflight: true, sponsor: true, commitment: "finalized" },
    });

    await signer.signAndSendTransactions([createTransaction()]);

    const input = signAndSendTransaction.mock.calls[0]?.[0];
    expect(input?.chain).toBe("solana:devnet");
    expect(input?.options).toEqual({
      skipPreflight: true,
      sponsor: true,
      commitment: "finalized",
    });
  });

  test("returns the signature Privy produced", async () => {
    const expected = signature(3);
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction: succeedWith(expected),
    });

    const signatures = await signer.signAndSendTransactions([
      createTransaction(),
    ]);

    expect(signatures).toEqual([expected]);
  });

  test("sends multiple transactions in order, one at a time", async () => {
    let inFlight = 0;
    const order: string[] = [];
    const signAndSendTransaction = mock(
      async ({ transaction }: { transaction: Uint8Array }) => {
        inFlight += 1;
        expect(inFlight).toBe(1);
        await Promise.resolve();
        order.push(transaction.byteLength.toString());
        inFlight -= 1;
        return { signature: signature(order.length) };
      },
    );
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
    });

    const signatures = await signer.signAndSendTransactions([
      createTransaction(),
      createTransaction("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
    ]);

    expect(signAndSendTransaction).toHaveBeenCalledTimes(2);
    expect(order).toHaveLength(2);
    expect(signatures).toEqual([signature(1), signature(2)]);
  });

  test("sends nothing when given no transactions", async () => {
    const signAndSendTransaction = succeedWith(signature(1));
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
    });

    expect(await signer.signAndSendTransactions([])).toEqual([]);
    expect(signAndSendTransaction).not.toHaveBeenCalled();
  });

  test("does not reach Privy when the signal is already aborted", async () => {
    const signAndSendTransaction = succeedWith(signature(1));
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
    });

    await expectRejection(
      signer.signAndSendTransactions([createTransaction()], {
        abortSignal: AbortSignal.abort(),
      }),
    );
    expect(signAndSendTransaction).not.toHaveBeenCalled();
  });

  test("stops sending the rest of the batch once the signal aborts", async () => {
    const abortController = new AbortController();
    const signAndSendTransaction = mock(() => {
      abortController.abort();
      return Promise.resolve({ signature: signature(1) });
    });
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction,
    });

    await expectRejection(
      signer.signAndSendTransactions(
        [createTransaction(), createTransaction()],
        { abortSignal: abortController.signal },
      ),
    );
    expect(signAndSendTransaction).toHaveBeenCalledTimes(1);
  });

  test("rejects a signature that is not 64 bytes", async () => {
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction: succeedWith(new Uint8Array(32)),
    });

    const error = await expectRejection(
      signer.signAndSendTransactions([createTransaction()]),
    );

    expect(error.message).toBe(
      "Privy returned a 32-byte signature; expected 64 bytes.",
    );
  });

  test("propagates the error when the user rejects in Privy", async () => {
    const signer = createPrivyTransactionSendingSigner({
      wallet,
      signAndSendTransaction: mock(() =>
        Promise.reject(new Error("User rejected the request")),
      ),
    });

    const error = await expectRejection(
      signer.signAndSendTransactions([createTransaction()]),
    );

    expect(error.message).toBe("User rejected the request");
  });
});
