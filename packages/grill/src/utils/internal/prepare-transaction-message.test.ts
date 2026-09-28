import type { simulateTransactionFactory } from "@macalinao/gill-extra";
import type {
  Address,
  Blockhash,
  Instruction,
  TransactionMessage,
  TransactionSigner,
} from "@solana/kit";
import type { GrillClient } from "../../types.js";
import { beforeAll, describe, expect, it } from "bun:test";
import {
  AccountRole,
  address,
  generateKeyPairSigner,
  getBase58Encoder,
  getTransactionMessageComputeUnitLimit,
  getTransactionMessageLoadedAccountsDataSizeLimit,
  isSolanaError,
  SOLANA_ERROR__TRANSACTION__EXCEEDS_SIZE_LIMIT,
} from "@solana/kit";
import { prepareTransactionMessage } from "./prepare-transaction-message.js";

const BLOCKHASH = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const INJECTED_BLOCKHASH = {
  blockhash: "22222222222222222222222222222222" as Blockhash,
  lastValidBlockHeight: 200n,
};

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const COMPUTE_BUDGET_PROGRAM = address(
  "ComputeBudget111111111111111111111111111111",
);

function makeIx(signerAddress: Address): Instruction {
  return {
    programAddress: MEMO_PROGRAM,
    accounts: [],
    data: getBase58Encoder().encode(signerAddress),
  };
}

function makeRpc(): {
  rpc: GrillClient["rpc"];
  getLatestBlockhashCalls: () => number;
} {
  let calls = 0;
  const rpc = {
    getLatestBlockhash: () => ({
      send: () => {
        calls += 1;
        return Promise.resolve({ value: BLOCKHASH });
      },
    }),
  } as unknown as GrillClient["rpc"];
  return { rpc, getLatestBlockhashCalls: () => calls };
}

/** A simulate fn that returns a fixed err value, spying on invocation. */
function makeSimulate(err: unknown): {
  simulate: ReturnType<typeof simulateTransactionFactory>;
  calls: () => number;
} {
  let calls = 0;
  const simulate = (() => {
    calls += 1;
    return Promise.resolve({ value: { err, logs: [] } });
  }) as unknown as ReturnType<typeof simulateTransactionFactory>;
  return { simulate, calls: () => calls };
}

describe("prepareTransactionMessage", () => {
  let signer: TransactionSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  const base = (rpc: GrillClient["rpc"]) => ({
    signer,
    rpc,
    name: "Test",
    ixs: [makeIx(signer.address)],
    cluster: "mainnet-beta" as const,
    onBuildError: () => {},
    onSimulationError: () => {},
  });

  it("fetches the blockhash when not injected", async () => {
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const { simulate } = makeSimulate(null);

    const { latestBlockhash } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { skipPreflight: true },
    });

    expect(getLatestBlockhashCalls()).toBe(1);
    expect(latestBlockhash).toBe(BLOCKHASH);
  });

  it("uses the injected blockhash without an RPC round trip", async () => {
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const { simulate } = makeSimulate(null);

    const { latestBlockhash } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { latestBlockhash: INJECTED_BLOCKHASH, skipPreflight: true },
    });

    expect(getLatestBlockhashCalls()).toBe(0);
    expect(latestBlockhash).toBe(INJECTED_BLOCKHASH);
  });

  it("compresses the message using address lookup tables when provided", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeSimulate(null);

    const lookupTableAddress = address(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    );
    const accountInTable = address(
      "So11111111111111111111111111111111111111112",
    );
    const ix: Instruction = {
      programAddress: MEMO_PROGRAM,
      accounts: [{ address: accountInTable, role: AccountRole.READONLY }],
      data: getBase58Encoder().encode(signer.address),
    };

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      ixs: [ix],
      simulateTransaction: simulate,
      options: {
        skipPreflight: true,
        lookupTables: { [lookupTableAddress]: [accountInTable] },
      },
    });

    const [compressedIx] = finalTransactionMessage.instructions;
    expect(compressedIx?.accounts?.[0]).toMatchObject({
      address: accountInTable,
      lookupTableAddress,
    });
  });

  it("skips simulation when skipPreflight is true", async () => {
    const { rpc } = makeRpc();
    const { simulate, calls } = makeSimulate(null);

    await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { skipPreflight: true },
    });

    expect(calls()).toBe(0);
  });

  it("runs simulation and throws + reports on simulation error", async () => {
    const { rpc } = makeRpc();
    const { simulate, calls } = makeSimulate({
      InstructionError: [0, "Custom"],
    });
    let reported: string | undefined;

    let caught: unknown;
    try {
      await prepareTransactionMessage({
        ...base(rpc),
        simulateTransaction: simulate,
        options: {},
        onSimulationError: (msg) => {
          reported = msg;
        },
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeDefined();
    expect(calls()).toBe(1);
    expect(reported).toBeDefined();
  });

  it("builds a version 0 message by default and honours options.version", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeSimulate(null);

    const v0 = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { skipPreflight: true },
    });
    expect(v0.finalTransactionMessage.version).toBe(0);

    const v1 = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: {
        skipPreflight: true,
        version: 1,
        computeUnitLimit: 200_000,
        loadedAccountsDataSizeLimit: 64_000,
        priorityFeeLamports: 5_000n,
      },
    });
    expect(v1.finalTransactionMessage.version).toBe(1);
  });

  it("reports and throws on options that cannot be built", async () => {
    const { rpc } = makeRpc();
    const { simulate, calls } = makeSimulate(null);
    const lookupTableAddress = address(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    );

    for (const options of [
      // v1 without a compute unit limit
      { version: 1 as const },
      // lookup tables on a non-v0 transaction
      {
        version: "legacy" as const,
        lookupTables: { [lookupTableAddress]: [MEMO_PROGRAM] },
      },
    ]) {
      const reported: string[] = [];
      const error = await prepareTransactionMessage({
        ...base(rpc),
        simulateTransaction: simulate,
        options,
        onBuildError: (msg) => {
          reported.push(msg);
        },
      }).then(
        () => undefined,
        (err: unknown) => err,
      );

      expect(error).toBeInstanceOf(Error);
      expect(reported).toEqual([(error as Error).message]);
    }
    expect(calls()).toBe(0);
  });
});

/**
 * A simulate fn that records each simulated message and reports the given
 * resources consumed (or a failure).
 */
function makeEstimatingSimulate({
  err = null,
  unitsConsumed = 12_345n,
  loadedAccountsDataSize = 4_096,
}: {
  err?: unknown;
  unitsConsumed?: bigint | null;
  loadedAccountsDataSize?: number | undefined;
} = {}): {
  simulate: ReturnType<typeof simulateTransactionFactory>;
  simulated: TransactionMessage[];
} {
  const simulated: TransactionMessage[] = [];
  const simulate = ((message: TransactionMessage) => {
    simulated.push(message);
    return Promise.resolve({
      value: { err, logs: [], unitsConsumed, loadedAccountsDataSize },
    });
  }) as unknown as ReturnType<typeof simulateTransactionFactory>;
  return { simulate, simulated };
}

/** Instructions that each reference a distinct readonly account. */
function makeIxsWithAccounts(accounts: Address[]): Instruction[] {
  return accounts.map((account) => ({
    programAddress: MEMO_PROGRAM,
    accounts: [{ address: account, role: AccountRole.READONLY }],
    data: new Uint8Array([1]),
  }));
}

async function makeAddresses(count: number): Promise<Address[]> {
  return Promise.all(
    Array.from(
      { length: count },
      async () => (await generateKeyPairSigner()).address,
    ),
  );
}

describe("prepareTransactionMessage resource limit estimation", () => {
  let signer: TransactionSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  const base = (rpc: GrillClient["rpc"]) => ({
    signer,
    rpc,
    name: "Test",
    ixs: [makeIx(signer.address)],
    cluster: "mainnet-beta" as const,
    onBuildError: () => {},
    onSimulationError: () => {},
  });

  it("leaves the limits unset when not opted in", async () => {
    const { rpc } = makeRpc();
    const { simulate, simulated } = makeEstimatingSimulate();

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: {},
    });

    // One plain preflight of the message that is returned.
    expect(simulated).toEqual([finalTransactionMessage]);
    expect(
      getTransactionMessageComputeUnitLimit(finalTransactionMessage),
    ).toBeUndefined();
  });

  it("estimates the compute unit limit with a single simulation", async () => {
    const { rpc } = makeRpc();
    const { simulate, simulated } = makeEstimatingSimulate({
      unitsConsumed: 10_000n,
    });

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { estimateResourceLimits: true, computeUnitPrice: 1_000n },
    });

    // The estimation simulation doubles as the preflight.
    expect(simulated).toHaveLength(1);
    const [simulatedMessage] = simulated;
    if (!simulatedMessage) {
      throw new Error("expected a simulation");
    }
    expect(getTransactionMessageComputeUnitLimit(simulatedMessage)).toBe(
      1_400_000,
    );
    // 10,000 CUs + a 9.84% margin (10% tapering towards 2% at 500k CUs).
    expect(getTransactionMessageComputeUnitLimit(finalTransactionMessage)).toBe(
      10_984,
    );
    // The provisory limit instruction was replaced, not duplicated, and the
    // compute budget instructions still precede the caller's instruction.
    expect(
      finalTransactionMessage.instructions.map((ix) => ix.programAddress),
    ).toEqual([COMPUTE_BUDGET_PROGRAM, COMPUTE_BUDGET_PROGRAM, MEMO_PROGRAM]);
  });

  it("never overrides an explicit compute unit limit", async () => {
    const { rpc } = makeRpc();
    const { simulate, simulated } = makeEstimatingSimulate();

    for (const computeUnitLimit of [50_000, 1_400_000]) {
      simulated.length = 0;
      const { finalTransactionMessage } = await prepareTransactionMessage({
        ...base(rpc),
        simulateTransaction: simulate,
        options: { estimateResourceLimits: true, computeUnitLimit },
      });

      expect(
        getTransactionMessageComputeUnitLimit(finalTransactionMessage),
      ).toBe(computeUnitLimit);
      // Nothing to estimate: an ordinary preflight of the final message.
      expect(simulated).toEqual([finalTransactionMessage]);
    }
  });

  it("respects skipPreflight when every limit is explicit", async () => {
    const { rpc } = makeRpc();
    const { simulate, simulated } = makeEstimatingSimulate();

    await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: {
        estimateResourceLimits: true,
        computeUnitLimit: 50_000,
        skipPreflight: true,
      },
    });

    expect(simulated).toHaveLength(0);
  });

  it("still simulates to estimate when skipPreflight is set", async () => {
    const { rpc } = makeRpc();
    const { simulate, simulated } = makeEstimatingSimulate();

    await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { estimateResourceLimits: true, skipPreflight: true },
    });

    expect(simulated).toHaveLength(1);
  });

  it("estimates both limits of a version 1 transaction", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeEstimatingSimulate({
      unitsConsumed: 500_000n,
      loadedAccountsDataSize: 8_192,
    });

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { estimateResourceLimits: true, version: 1 },
    });

    expect(finalTransactionMessage.version).toBe(1);
    // 500,000 CUs + a 2% margin (one CU of float rounding, exactly as
    // `@solana/kit-plugin-rpc` computes it).
    expect(getTransactionMessageComputeUnitLimit(finalTransactionMessage)).toBe(
      510_001,
    );
    expect(
      getTransactionMessageLoadedAccountsDataSizeLimit(finalTransactionMessage),
    ).toBe(8_192);
  });

  it("keeps an explicit v1 limit while estimating the other", async () => {
    const { rpc } = makeRpc();
    const { simulate, simulated } = makeEstimatingSimulate({
      unitsConsumed: 1_000n,
      loadedAccountsDataSize: 8_192,
    });

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: {
        estimateResourceLimits: true,
        version: 1,
        loadedAccountsDataSizeLimit: 64_000,
      },
    });

    // The explicit limit is simulated as-is, and kept.
    const [simulatedMessage] = simulated;
    if (!simulatedMessage) {
      throw new Error("expected a simulation");
    }
    expect(
      getTransactionMessageLoadedAccountsDataSizeLimit(simulatedMessage),
    ).toBe(64_000);
    expect(
      getTransactionMessageLoadedAccountsDataSizeLimit(finalTransactionMessage),
    ).toBe(64_000);
    // 1,000 CUs + the 300 CU minimum margin.
    expect(getTransactionMessageComputeUnitLimit(finalTransactionMessage)).toBe(
      1_300,
    );
  });

  it("reports a failed estimation simulation like a failed preflight", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeEstimatingSimulate({
      err: { InstructionError: [0, "Custom"] },
    });
    const reported: string[] = [];

    const error = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { estimateResourceLimits: true },
      onSimulationError: (msg) => {
        reported.push(msg);
      },
    }).then(
      () => undefined,
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(Error);
    expect(reported).toHaveLength(1);
  });

  it("fails when the simulation does not report the units consumed", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeEstimatingSimulate({ unitsConsumed: null });
    const reported: string[] = [];

    const error = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { estimateResourceLimits: true },
      onSimulationError: (msg) => {
        reported.push(msg);
      },
    }).then(
      () => undefined,
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(Error);
    expect(reported).toEqual([(error as Error).message]);
  });
});

describe("prepareTransactionMessage planning", () => {
  let signer: TransactionSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  const base = (rpc: GrillClient["rpc"]) => ({
    signer,
    rpc,
    name: "Test",
    ixs: [makeIx(signer.address)],
    cluster: "mainnet-beta" as const,
    onBuildError: () => {},
    onSimulationError: () => {},
  });

  it("keeps every instruction in order in one message", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeSimulate(null);
    // More than the planner's default of 16 instructions per transaction.
    const ixs = Array.from({ length: 20 }, (_, i) => ({
      programAddress: MEMO_PROGRAM,
      accounts: [],
      data: new Uint8Array([i]),
    }));

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      ixs,
      simulateTransaction: simulate,
      options: { skipPreflight: true },
    });

    expect(finalTransactionMessage.instructions).toEqual(ixs);
  });

  it("builds a message with no instructions", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeSimulate(null);

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      ixs: [],
      simulateTransaction: simulate,
      options: { skipPreflight: true, computeUnitLimit: 1_000 },
    });

    expect(
      finalTransactionMessage.instructions.map((ix) => ix.programAddress),
    ).toEqual([COMPUTE_BUDGET_PROGRAM]);
  });

  it("compresses before the size checks, so a table-backed transaction fits", async () => {
    const { rpc } = makeRpc();
    const { simulate } = makeSimulate(null);
    // 40 accounts: 1,280 bytes of addresses uncompressed, over the 1,232-byte
    // limit; one byte each through a lookup table.
    const accounts = await makeAddresses(40);
    const lookupTableAddress = address(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    );

    const { finalTransactionMessage } = await prepareTransactionMessage({
      ...base(rpc),
      ixs: makeIxsWithAccounts(accounts),
      simulateTransaction: simulate,
      options: {
        skipPreflight: true,
        lookupTables: { [lookupTableAddress]: accounts },
      },
    });

    expect(finalTransactionMessage.instructions).toHaveLength(40);
    for (const ix of finalTransactionMessage.instructions) {
      expect(ix.accounts?.[0]).toMatchObject({ lookupTableAddress });
    }
  });

  it("fails instead of splitting instructions that do not fit in one transaction", async () => {
    const { rpc } = makeRpc();
    const { simulate, calls } = makeSimulate(null);
    const reported: string[] = [];

    const error = await prepareTransactionMessage({
      ...base(rpc),
      // The same 40 accounts without a lookup table are too large.
      ixs: makeIxsWithAccounts(await makeAddresses(40)),
      simulateTransaction: simulate,
      options: {},
      onBuildError: (msg) => {
        reported.push(msg);
      },
    }).then(
      () => undefined,
      (err: unknown) => err,
    );

    expect(
      isSolanaError(error, SOLANA_ERROR__TRANSACTION__EXCEEDS_SIZE_LIMIT),
    ).toBe(true);
    expect(reported).toEqual([(error as Error).message]);
    expect(calls()).toBe(0);
  });
});
