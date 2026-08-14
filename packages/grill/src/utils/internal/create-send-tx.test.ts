import type { Logger } from "@macalinao/gill-extra";
import type {
  Address,
  Blockhash,
  BlockhashLifetimeConstraint,
  Instruction,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import { beforeAll, describe, expect, it, mock } from "bun:test";
import * as gillExtra from "@macalinao/gill-extra";
import { createLogger } from "@macalinao/gill-extra";
import {
  AccountRole,
  address,
  generateKeyPairSigner,
  getBase58Encoder,
} from "@solana/kit";

const BLOCKHASH: BlockhashLifetimeConstraint = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const INJECTED: BlockhashLifetimeConstraint = {
  blockhash: "So11111111111111111111111111111111111111112" as Blockhash,
  lastValidBlockHeight: 200n,
};

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const WRITABLE = address("SysvarC1ock11111111111111111111111111111111");
const READONLY = address("SysvarRent111111111111111111111111111111111");

// A fixed 64-byte signature returned by the sending signer.
const SIG_BYTES = new Uint8Array(64).fill(7) as SignatureBytes;

/**
 * Captures what `confirmTransaction` was handed so we can assert which
 * blockhash was baked into the transaction and which confirmation knobs the
 * caller's options reached. A holder object is used so control-flow narrowing
 * does not collapse the values to `undefined` across the awaited `sendTX` call.
 */
const confirmed: {
  lastValidBlockHeight?: bigint | undefined;
  hasSubscriptions?: boolean | undefined;
  maxRetries?: number | undefined;
  retryInterval?: number | undefined;
} = {};

await mock.module("@macalinao/gill-extra", () => ({
  ...gillExtra,
  confirmTransaction: ({
    lastValidBlockHeight,
    rpcSubscriptions,
    maxRetries,
    retryInterval,
  }: {
    lastValidBlockHeight: bigint;
    rpcSubscriptions?: unknown;
    maxRetries?: number;
    retryInterval?: number;
  }) => {
    confirmed.lastValidBlockHeight = lastValidBlockHeight;
    confirmed.hasSubscriptions = rpcSubscriptions !== undefined;
    confirmed.maxRetries = maxRetries;
    confirmed.retryInterval = retryInterval;
    return Promise.resolve({ err: null });
  },
}));

// Imported after the module mock is installed so the mocked binding is used.
const { createSendTX } = await import("./create-send-tx.js");

function makeIx(signerAddress: Address): Instruction {
  return {
    programAddress: MEMO_PROGRAM,
    accounts: [],
    data: getBase58Encoder().encode(signerAddress),
  };
}

function makeIxWithAccounts(): Instruction {
  return {
    programAddress: MEMO_PROGRAM,
    accounts: [
      { address: WRITABLE, role: AccountRole.WRITABLE },
      { address: READONLY, role: AccountRole.READONLY },
    ],
    data: new Uint8Array(),
  };
}

function makeRpc(): {
  rpc: SolanaClient["rpc"];
  getLatestBlockhashCalls: () => number;
  getTransactionCalls: () => number;
} {
  let blockhashCalls = 0;
  let transactionCalls = 0;
  const rpc = {
    getLatestBlockhash: () => ({
      send: () => {
        blockhashCalls += 1;
        return Promise.resolve({ value: BLOCKHASH });
      },
    }),
    getTransaction: () => ({
      send: () => {
        transactionCalls += 1;
        return Promise.resolve({
          meta: { logMessages: ["Program log: hello"] },
        });
      },
    }),
  } as unknown as SolanaClient["rpc"];
  return {
    rpc,
    getLatestBlockhashCalls: () => blockhashCalls,
    getTransactionCalls: () => transactionCalls,
  };
}

function makeSendingSigner(addr: Address): TransactionSendingSigner {
  return {
    address: addr,
    signAndSendTransactions: () => Promise.resolve([SIG_BYTES]),
  };
}

describe("createSendTX", () => {
  let signer: TransactionSendingSigner;

  beforeAll(async () => {
    const kp = await generateKeyPairSigner();
    signer = makeSendingSigner(kp.address);
  });

  const params = (
    rpc: SolanaClient["rpc"],
    extra: {
      refetchAccounts?: (addresses: Address[]) => Promise<void>;
      rpcSubscriptions?: SolanaClient["rpcSubscriptions"];
      logger?: Logger;
    } = {},
  ) => ({
    signer,
    rpc,
    refetchAccounts: () => Promise.resolve(),
    onTransactionStatusEvent: () => {},
    getExplorerLink: () => "https://example.com",
    ...extra,
  });

  describe("blockhash injection", () => {
    it("uses an injected blockhash without hitting the RPC", async () => {
      confirmed.lastValidBlockHeight = undefined;
      const { rpc, getLatestBlockhashCalls } = makeRpc();
      const sendTX = createSendTX(params(rpc));

      await sendTX("Test", [makeIx(signer.address)], {
        skipPreflight: true,
        latestBlockhash: INJECTED,
      });

      expect(getLatestBlockhashCalls()).toBe(0);
      expect<bigint | undefined>(confirmed.lastValidBlockHeight).toBe(
        INJECTED.lastValidBlockHeight,
      );
    });

    it("fetches the blockhash when not injected", async () => {
      confirmed.lastValidBlockHeight = undefined;
      const { rpc, getLatestBlockhashCalls } = makeRpc();
      const sendTX = createSendTX(params(rpc));

      await sendTX("Test", [makeIx(signer.address)], {
        skipPreflight: true,
      });

      expect(getLatestBlockhashCalls()).toBe(1);
      expect<bigint | undefined>(confirmed.lastValidBlockHeight).toBe(
        BLOCKHASH.lastValidBlockHeight,
      );
    });
  });

  describe("confirmation", () => {
    it("passes the subscriptions client through when it has one", async () => {
      confirmed.hasSubscriptions = undefined;
      const { rpc } = makeRpc();
      const sendTX = createSendTX(
        params(rpc, {
          rpcSubscriptions: {} as unknown as SolanaClient["rpcSubscriptions"],
        }),
      );

      await sendTX("Test", [makeIx(signer.address)], { skipPreflight: true });

      expect<boolean | undefined>(confirmed.hasSubscriptions).toBe(true);
    });

    it("confirms without a subscriptions client", async () => {
      confirmed.hasSubscriptions = undefined;
      const { rpc } = makeRpc();
      const sendTX = createSendTX(params(rpc));

      await sendTX("Test", [makeIx(signer.address)], { skipPreflight: true });

      expect<boolean | undefined>(confirmed.hasSubscriptions).toBe(false);
    });

    it("forwards the caller's confirmation tuning", async () => {
      confirmed.maxRetries = undefined;
      confirmed.retryInterval = undefined;
      const { rpc } = makeRpc();
      const sendTX = createSendTX(params(rpc));

      await sendTX("Test", [makeIx(signer.address)], {
        skipPreflight: true,
        confirmation: { maxRetries: 3, retryInterval: 50 },
      });

      expect<number | undefined>(confirmed.maxRetries).toBe(3);
      expect<number | undefined>(confirmed.retryInterval).toBe(50);
    });
  });

  describe("account refetching", () => {
    it("refetches the writable accounts derived from the message", async () => {
      const { rpc } = makeRpc();
      const refetched: Address[][] = [];
      const sendTX = createSendTX(
        params(rpc, {
          refetchAccounts: (addresses) => {
            refetched.push(addresses);
            return Promise.resolve();
          },
        }),
      );

      await sendTX("Test", [makeIxWithAccounts()], { skipPreflight: true });

      expect(refetched).toHaveLength(1);
      expect(refetched[0]).toEqual([signer.address, WRITABLE]);
    });
  });

  describe("transaction logs", () => {
    it("does not fetch the confirmed transaction by default", async () => {
      const { rpc, getTransactionCalls } = makeRpc();
      const sendTX = createSendTX(
        params(rpc, { logger: createLogger("debug") }),
      );

      await sendTX("Test", [makeIx(signer.address)], { skipPreflight: true });

      expect(getTransactionCalls()).toBe(0);
    });

    it("fetches them when the caller opts in at the debug level", async () => {
      const { rpc, getTransactionCalls } = makeRpc();
      const sendTX = createSendTX(
        params(rpc, { logger: createLogger("debug") }),
      );

      await sendTX("Test", [makeIx(signer.address)], {
        skipPreflight: true,
        fetchTransactionLogs: true,
      });

      expect(getTransactionCalls()).toBe(1);
    });

    it("skips the fetch when the logger is quieter than debug", async () => {
      const { rpc, getTransactionCalls } = makeRpc();
      const sendTX = createSendTX(
        params(rpc, { logger: createLogger("info") }),
      );

      await sendTX("Test", [makeIx(signer.address)], {
        skipPreflight: true,
        fetchTransactionLogs: true,
      });

      expect(getTransactionCalls()).toBe(0);
    });
  });
});
