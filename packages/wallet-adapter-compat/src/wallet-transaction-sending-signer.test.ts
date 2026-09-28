import type { Blockhash, Instruction, TransactionVersion } from "@solana/kit";
import type { WalletAdapter } from "./wallet-transaction-sending-signer.js";
import { describe, expect, it } from "bun:test";
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createTransactionMessage,
  getBase58Decoder,
  pipe,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { createWalletTransactionSendingSigner } from "./wallet-transaction-sending-signer.js";

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const PAYER = address("So11111111111111111111111111111111111111112");

const memoIx = (): Instruction => ({
  data: new Uint8Array([1, 2]),
  programAddress: MEMO_PROGRAM,
});

const LATEST_BLOCKHASH = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const SIGNATURE = getBase58Decoder().decode(new Uint8Array(64).fill(7));

/** A wallet adapter that records the transactions it was asked to send. */
const makeWallet = (): { wallet: WalletAdapter; sent: unknown[] } => {
  const sent: unknown[] = [];
  return {
    sent,
    wallet: {
      publicKey: new PublicKey(PAYER),
      sendTransaction: (transaction) => {
        sent.push(transaction);
        return Promise.resolve(SIGNATURE);
      },
    },
  };
};

const compileMemoTransaction = (version: TransactionVersion) =>
  compileTransaction(
    pipe(
      createTransactionMessage({ version }),
      (m) => setTransactionMessageFeePayer(PAYER, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(LATEST_BLOCKHASH, m),
      (m) => setTransactionMessageComputeUnitLimit(200_000, m),
      (m) => appendTransactionMessageInstruction(memoIx(), m),
    ),
  );

const connection = new Connection("http://127.0.0.1:8899");

describe("createWalletTransactionSendingSigner", () => {
  it("sends a version 0 transaction through the wallet", async () => {
    const { wallet, sent } = makeWallet();
    const signer = createWalletTransactionSendingSigner(wallet, connection);
    if (!signer) {
      throw new Error("expected a signer");
    }
    const compiled = compileMemoTransaction(0);

    const [signature] = await signer.signAndSendTransactions([compiled]);

    expect(signature).toHaveLength(64);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(VersionedTransaction);
  });

  it("rejects a version 1 transaction before reaching the wallet", async () => {
    const { wallet, sent } = makeWallet();
    const signer = createWalletTransactionSendingSigner(wallet, connection);
    if (!signer) {
      throw new Error("expected a signer");
    }
    const compiled = compileMemoTransaction(1);

    const error = await signer.signAndSendTransactions([compiled]).then(
      () => undefined,
      (err: unknown) => err,
    );

    expect(String(error)).toMatch(/Version 1 transactions cannot be sent/);
    expect(sent).toHaveLength(0);
  });
});
