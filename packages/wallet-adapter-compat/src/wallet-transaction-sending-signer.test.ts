import type { Blockhash, Instruction } from "@solana/kit";
import type {
  Connection,
  VersionedTransaction as Web3VersionedTransaction,
} from "@solana/web3.js";
// oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-argument, typescript/no-unsafe-call, typescript/no-unsafe-member-access, typescript/no-unsafe-return -- tsgolint resolves
// gill's createTransaction() and kit's compileTransaction() to an error type in this
// tree; tsc types them correctly. Re-enable once typescript-go handles these signatures.
import type { WalletAdapter } from "./wallet-transaction-sending-signer.js";
import { describe, expect, it } from "bun:test";
import {
  address,
  compileTransaction,
  isTransactionPartialSigner,
} from "@solana/kit";
import { Keypair } from "@solana/web3.js";
import { createTransaction } from "gill";
import { createWalletTransactionSendingSigner } from "./wallet-transaction-sending-signer.js";

const BLOCKHASH = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const FIXED_SIGNATURE = new Uint8Array(64).fill(7);

const connection = {} as unknown as Connection;

/** Builds a compiled kit transaction with the given fee payer and no signatures. */
function buildTransaction(feePayer: string) {
  const ix: Instruction = {
    programAddress: MEMO_PROGRAM,
    accounts: [],
    data: new Uint8Array([1, 2, 3]),
  };
  const message = createTransaction({
    version: 0,
    feePayer: address(feePayer),
    instructions: [ix],
    latestBlockhash: BLOCKHASH,
  });
  return compileTransaction(message);
}

describe("createWalletTransactionSendingSigner", () => {
  it("returns null when the wallet is not connected", () => {
    const adapter: WalletAdapter = {
      publicKey: null,
      sendTransaction: () => Promise.resolve("sig"),
    };
    expect(
      createWalletTransactionSendingSigner(adapter, connection),
    ).toBeNull();
  });

  it("exposes partial signing when the wallet supports signTransaction", async () => {
    const kp = Keypair.generate();
    const pubkey = kp.publicKey;

    let signCalled = 0;
    const adapter: WalletAdapter = {
      publicKey: pubkey,
      sendTransaction: () => Promise.resolve("sig"),
      // Stamp a fixed signature for the fee payer and return the transaction.
      signTransaction: (<T extends Web3VersionedTransaction>(tx: T) => {
        signCalled += 1;
        tx.addSignature(pubkey, FIXED_SIGNATURE);
        return Promise.resolve(tx);
      }) as WalletAdapter["signTransaction"],
    };

    const signer = createWalletTransactionSendingSigner(adapter, connection);
    expect(signer).not.toBeNull();
    if (!signer) {
      return;
    }

    // It is recognized as a partial signer.
    expect(isTransactionPartialSigner(signer)).toBe(true);
    expect(signer.signTransactions).toBeDefined();

    const tx = buildTransaction(pubkey.toBase58());
    const dicts = await signer.signTransactions?.([tx]);

    expect(signCalled).toBe(1);
    expect(dicts).toBeDefined();
    const dict = dicts?.[0];
    const sig = dict?.[signer.address];
    expect(sig ? Array.from(sig) : undefined).toEqual(
      Array.from(FIXED_SIGNATURE),
    );
  });

  it("does not expose partial signing when signTransaction is absent", () => {
    const kp = Keypair.generate();
    const adapter: WalletAdapter = {
      publicKey: kp.publicKey,
      sendTransaction: () => Promise.resolve("sig"),
    };

    const signer = createWalletTransactionSendingSigner(adapter, connection);
    expect(signer).not.toBeNull();
    if (!signer) {
      return;
    }

    expect(isTransactionPartialSigner(signer)).toBe(false);
    expect(signer.signTransactions).toBeUndefined();
    // Sending capability is unchanged.
    expect(signer.signAndSendTransactions).toBeDefined();
  });
});
