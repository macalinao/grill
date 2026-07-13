import type { Mock } from "bun:test";
import type { SignatureBytes } from "@solana/kit";
import type {
  PrivySignAndSendTransactionInput,
  PrivySignAndSendTransactionOutput,
  PrivySolanaWallet,
} from "./types.js";
import { expect, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

/** Address of the wallet Privy hands back by default in tests. */
export const MOCK_WALLET_ADDRESS =
  "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrq";

/** Address of a second wallet, for tests that select between wallets. */
export const MOCK_SECOND_WALLET_ADDRESS =
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

/** A well-formed 64-byte signature. */
export const MOCK_SIGNATURE: SignatureBytes = new Uint8Array(64).fill(
  7,
) as SignatureBytes;

export interface PrivyMockWallet extends PrivySolanaWallet {
  address: string;
}

export interface PrivyMockState {
  /** Value returned as `ready` by Privy's `useWallets`. */
  ready: boolean;
  /** Value returned as `wallets` by Privy's `useWallets`. */
  wallets: PrivyMockWallet[];
  /** Implementation behind Privy's `useSignAndSendTransaction`. */
  signAndSendTransaction: Mock<
    (
      input: PrivySignAndSendTransactionInput<PrivyMockWallet>,
    ) => Promise<PrivySignAndSendTransactionOutput>
  >;
  /** Implementation behind Privy's `useCreateWallet`. */
  createWallet: Mock<
    (options?: {
      createAdditional?: boolean;
    }) => Promise<{ wallet: { address: string } }>
  >;
}

/**
 * Awaits a promise that is expected to reject, and returns the error it threw.
 *
 * Bun types `expect(...).rejects.toThrow()` as returning `void`, which trips
 * the repo's `await-thenable` lint rule, so tests assert on the error instead.
 */
export const expectRejection = async (
  promise: Promise<unknown>,
): Promise<Error> => {
  try {
    await promise;
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(Error);
    return error as Error;
  }
  throw new Error("expected the promise to reject, but it resolved");
};

/**
 * The state the mocked Privy SDK reads from. Tests mutate this to describe the
 * Privy environment they want, then render.
 */
export const privyMock: PrivyMockState = {
  ready: false,
  wallets: [],
  signAndSendTransaction: mock(),
  createWallet: mock(),
};

/**
 * Restores the mocked Privy SDK to a signed-out user with a working wallet
 * backend. Call this from `beforeEach`.
 */
export const resetPrivyMock = (): void => {
  privyMock.ready = false;
  privyMock.wallets = [];
  privyMock.signAndSendTransaction = mock(() =>
    Promise.resolve({ signature: MOCK_SIGNATURE }),
  );
  privyMock.createWallet = mock(() =>
    Promise.resolve({ wallet: { address: MOCK_WALLET_ADDRESS } }),
  );
};

resetPrivyMock();

// The Privy SDK is replaced wholesale: it needs a browser, a Privy app id, and
// a signed-in user, none of which exist in a unit test. Mocking it here (rather
// than in each test file) means every test file shares one implementation --
// module mocks in Bun are process-wide, so per-file mocks of the same module
// would overwrite each other.
void mock.module("@privy-io/react-auth/solana", () => ({
  useCreateWallet: () => ({
    createWallet: (options?: { createAdditional?: boolean }) =>
      privyMock.createWallet(options),
  }),
  useSignAndSendTransaction: () => ({
    signAndSendTransaction: (
      input: PrivySignAndSendTransactionInput<PrivyMockWallet>,
    ) => privyMock.signAndSendTransaction(input),
  }),
  useWallets: () => ({ ready: privyMock.ready, wallets: privyMock.wallets }),
}));
