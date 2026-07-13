import type {
  Address,
  SignatureBytes,
  Transaction,
  TransactionSendingSigner,
} from "@solana/kit";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  address,
  blockhash,
  compileTransaction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { renderHook } from "@testing-library/react";
import {
  MOCK_SECOND_WALLET_ADDRESS,
  MOCK_SIGNATURE,
  MOCK_WALLET_ADDRESS,
  privyMock,
  resetPrivyMock,
} from "../test-setup.js";
import { usePrivySigner } from "./use-privy-signer.js";

const createTransaction = (): Transaction =>
  pipe(
    createTransactionMessage({ version: 0 }),
    (message) =>
      setTransactionMessageFeePayer(address(MOCK_WALLET_ADDRESS), message),
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

/** Asserts that a signer was produced, and narrows away the `null`. */
const expectSigner = (
  signer: TransactionSendingSigner<Address> | null,
): TransactionSendingSigner<Address> => {
  if (!signer) {
    throw new Error("expected usePrivySigner to produce a signer");
  }
  return signer;
};

/** Signs in as a user with the given Privy Solana wallets. */
const connect = (...addresses: string[]): void => {
  privyMock.ready = true;
  privyMock.wallets = addresses.map((walletAddress) => ({
    address: walletAddress,
  }));
};

describe("usePrivySigner", () => {
  beforeEach(() => {
    resetPrivyMock();
  });

  test("has no signer while Privy is still loading", () => {
    privyMock.wallets = [{ address: MOCK_WALLET_ADDRESS }];

    const { result } = renderHook(() => usePrivySigner());

    expect(result.current).toBeNull();
  });

  test("has no signer when the user has no Solana wallet", () => {
    privyMock.ready = true;

    const { result } = renderHook(() => usePrivySigner());

    expect(result.current).toBeNull();
  });

  test("has no signer when the requested wallet is not connected", () => {
    connect(MOCK_WALLET_ADDRESS);

    const { result } = renderHook(() =>
      usePrivySigner({ address: MOCK_SECOND_WALLET_ADDRESS }),
    );

    expect(result.current).toBeNull();
  });

  test("signs with the user's first wallet by default", () => {
    connect(MOCK_WALLET_ADDRESS, MOCK_SECOND_WALLET_ADDRESS);

    const { result } = renderHook(() => usePrivySigner());

    expect(expectSigner(result.current).address).toBe(
      address(MOCK_WALLET_ADDRESS),
    );
  });

  test("signs with the wallet at the requested address", () => {
    connect(MOCK_WALLET_ADDRESS, MOCK_SECOND_WALLET_ADDRESS);

    const { result } = renderHook(() =>
      usePrivySigner({ address: MOCK_SECOND_WALLET_ADDRESS }),
    );

    expect(expectSigner(result.current).address).toBe(
      address(MOCK_SECOND_WALLET_ADDRESS),
    );
  });

  test("sends transactions through Privy", async () => {
    connect(MOCK_WALLET_ADDRESS);
    const { result } = renderHook(() => usePrivySigner());

    const signatures = await expectSigner(
      result.current,
    ).signAndSendTransactions([createTransaction()]);

    expect(signatures).toEqual([MOCK_SIGNATURE]);
    expect(privyMock.signAndSendTransaction).toHaveBeenCalledTimes(1);
    const input = privyMock.signAndSendTransaction.mock.calls[0]?.[0];
    expect(input?.wallet).toBe(privyMock.wallets[0]);
    expect(input?.chain).toBe("solana:mainnet");
  });

  test("forwards the chain and options to Privy", async () => {
    connect(MOCK_WALLET_ADDRESS);
    const options = { skipPreflight: true };
    const { result } = renderHook(() =>
      usePrivySigner({ chain: "solana:devnet", options }),
    );

    await expectSigner(result.current).signAndSendTransactions([
      createTransaction(),
    ]);

    const input = privyMock.signAndSendTransaction.mock.calls[0]?.[0];
    expect(input?.chain).toBe("solana:devnet");
    expect(input?.options).toBe(options);
  });

  test("keeps the same signer across re-renders", () => {
    connect(MOCK_WALLET_ADDRESS);
    const { result, rerender } = renderHook(() => usePrivySigner());
    const signer = result.current;

    rerender();

    expect(result.current).toBe(signer);
  });

  test("sends through Privy's latest signing function", async () => {
    connect(MOCK_WALLET_ADDRESS);
    const { result, rerender } = renderHook(() => usePrivySigner());
    const signer = expectSigner(result.current);

    // Privy hands out a new signing function on every render; the signer must
    // pick up the newest one rather than the one captured when it was built.
    const laterSignature = new Uint8Array(64).fill(9) as SignatureBytes;
    privyMock.signAndSendTransaction = mock(() =>
      Promise.resolve({ signature: laterSignature }),
    );
    rerender();

    expect(await signer.signAndSendTransactions([createTransaction()])).toEqual(
      [laterSignature],
    );
  });
});
