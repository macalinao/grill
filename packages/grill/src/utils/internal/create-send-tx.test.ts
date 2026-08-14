import type {
  Address,
  Blockhash,
  BlockhashLifetimeConstraint,
  Instruction,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import type { TransactionStatusEvent } from "../../types.js";
import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
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

/** Lets a test make confirmation reject instead of resolving successfully. */
const confirmControl: { error?: Error | undefined } = {};

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
    if (confirmControl.error !== undefined) {
      throw confirmControl.error;
    }
    return Promise.resolve({ err: null });
  },
}));

/** Finds an emitted event and narrows it to its discriminated variant. */
function findEvent<T extends TransactionStatusEvent["type"]>(
  events: TransactionStatusEvent[],
  type: T,
): Extract<TransactionStatusEvent, { type: T }> | undefined {
  return events.find(
    (e): e is Extract<TransactionStatusEvent, { type: T }> => e.type === type,
  );
}

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

/** A sending signer whose broadcast always rejects. */
function makeFailingSigner(
  addr: Address,
  error: Error,
): TransactionSendingSigner {
  return {
    address: addr,
    signAndSendTransactions: () => Promise.reject(error),
  };
}

/** Records the addresses handed to refetchAccounts and lets a test block it. */
function makeRefetch(neverResolves = false): {
  refetchAccounts: (addresses: Address[]) => Promise<void>;
  calls: () => Address[][];
} {
  const calls: Address[][] = [];
  const refetchAccounts = (addresses: Address[]): Promise<void> => {
    calls.push(addresses);
    return neverResolves ? new Promise<void>(() => {}) : Promise.resolve();
  };
  return { refetchAccounts, calls: () => calls };
}

describe("createSendTX", () => {
  let signer: TransactionSendingSigner;

  beforeAll(async () => {
    const kp = await generateKeyPairSigner();
    signer = makeSendingSigner(kp.address);
  });

  beforeEach(() => {
    confirmed.lastValidBlockHeight = undefined;
    confirmed.hasSubscriptions = undefined;
    confirmed.maxRetries = undefined;
    confirmed.retryInterval = undefined;
    confirmControl.error = undefined;
  });

  const params = (
    rpc: SolanaClient["rpc"],
    overrides: Partial<Parameters<typeof createSendTX>[0]> = {},
  ) => ({
    signer,
    rpc,
    refetchAccounts: () => Promise.resolve(),
    onTransactionStatusEvent: () => {},
    getExplorerLink: () => "https://example.com",
    ...overrides,
  });

  describe("blockhash injection", () => {
    it("uses an injected blockhash without hitting the RPC", async () => {
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

  describe("happy path", () => {
    it("returns the signature and emits the full lifecycle", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      const explorerLinks: string[] = [];
      const sendTX = createSendTX(
        params(rpc, {
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
          getExplorerLink: () => {
            const link = "https://explorer.example/tx";
            explorerLinks.push(link);
            return link;
          },
        }),
      );

      const sig = await sendTX("Send", [makeIx(signer.address)], {
        skipPreflight: true,
      });

      // A base58 signature string is returned.
      expect(typeof sig).toBe("string");
      expect(sig.length).toBeGreaterThan(0);

      // Lifecycle events fire in order, ending in confirmation.
      expect(events.map((e) => e.type)).toEqual([
        "preparing",
        "awaiting-wallet-signature",
        "waiting-for-confirmation",
        "confirmed",
      ]);

      // The explorer link is attached to the post-send events.
      const confirmedEvent = findEvent(events, "confirmed");
      expect(confirmedEvent).toBeDefined();
      expect(confirmedEvent?.sig).toBe(sig);
      expect(confirmedEvent?.explorerLink).toBe("https://explorer.example/tx");
      expect(explorerLinks.length).toBeGreaterThan(0);
    });
  });

  describe("wallet not connected", () => {
    it("emits an error event and throws when there is no signer", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      const sendTX = createSendTX(
        params(rpc, {
          signer: null,
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
        }),
      );

      let caught: unknown;
      try {
        await sendTX("No wallet", [makeIx(signer.address)], {
          skipPreflight: true,
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain("Wallet not connected");
      expect(events.map((e) => e.type)).toEqual(["error-wallet-not-connected"]);
    });
  });

  describe("send failure", () => {
    it("emits error-transaction-send-failed and rethrows", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      const failingSigner = makeFailingSigner(
        signer.address,
        new Error("user rejected the request"),
      );
      const sendTX = createSendTX(
        params(rpc, {
          signer: failingSigner,
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
        }),
      );

      let caught: unknown;
      try {
        await sendTX("Rejected", [makeIx(signer.address)], {
          skipPreflight: true,
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain("user rejected");

      const sendFailed = findEvent(events, "error-transaction-send-failed");
      expect(sendFailed).toBeDefined();
      expect(sendFailed?.errorMessage).toContain("user rejected");
      // Never reaches confirmation.
      expect(events.map((e) => e.type)).not.toContain(
        "waiting-for-confirmation",
      );
    });
  });

  describe("confirmation", () => {
    it("passes the subscriptions client through when it has one", async () => {
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
      const { rpc } = makeRpc();
      const sendTX = createSendTX(params(rpc));

      await sendTX("Test", [makeIx(signer.address)], { skipPreflight: true });

      expect<boolean | undefined>(confirmed.hasSubscriptions).toBe(false);
    });

    it("forwards the caller's confirmation tuning", async () => {
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
      const { refetchAccounts, calls } = makeRefetch();
      const sendTX = createSendTX(params(rpc, { refetchAccounts }));

      await sendTX("Test", [makeIxWithAccounts()], { skipPreflight: true });

      expect(calls()).toEqual([[signer.address, WRITABLE]]);
    });

    it("resolves without waiting when waitForAccountRefetch is false", async () => {
      const { rpc } = makeRpc();
      // A refetch that never resolves would hang the call if it were awaited.
      const { refetchAccounts, calls } = makeRefetch(true);
      const sendTX = createSendTX(params(rpc, { refetchAccounts }));

      const sig = await sendTX("Background", [makeIxWithAccounts()], {
        skipPreflight: true,
        waitForAccountRefetch: false,
      });

      expect(typeof sig).toBe("string");
      // Refetch was still kicked off, just not awaited.
      expect(calls()).toEqual([[signer.address, WRITABLE]]);
    });
  });

  describe("confirmation failure", () => {
    it("emits error-transaction-failed and rethrows", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      // A Solana-style error carrying logs in a nested context.
      confirmControl.error = Object.assign(new Error("Transaction expired"), {
        context: { logs: ["Program log: boom"] },
      });
      const sendTX = createSendTX(
        params(rpc, {
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
        }),
      );

      let caught: unknown;
      try {
        await sendTX("Expired", [makeIx(signer.address)], {
          skipPreflight: true,
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain("Transaction expired");

      const failed = findEvent(events, "error-transaction-failed");
      expect(failed).toBeDefined();
      expect(failed?.errorMessage).toContain("Transaction expired");
      expect(failed?.sig).toBeTruthy();
      // It did reach the send/confirmation stage before failing.
      expect(events.map((e) => e.type)).toContain("waiting-for-confirmation");
      expect(events.map((e) => e.type)).not.toContain("confirmed");
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
