import type { Transaction } from "@solana/kit";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test } from "bun:test";
import { useKitWallet } from "@macalinao/grill";
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
  MOCK_WALLET_ADDRESS,
  privyMock,
  resetPrivyMock,
} from "../test-setup.js";
import { PrivyGrillProvider } from "./privy-grill-provider.js";

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

/** Renders the provider and reads back what grill's WalletProvider received. */
const renderWithProvider = (
  provider: (children: ReactNode) => ReactNode,
): ReturnType<typeof renderHook<ReturnType<typeof useKitWallet>, undefined>> =>
  renderHook(() => useKitWallet(), {
    wrapper: ({ children }) => provider(children),
  });

describe("PrivyGrillProvider", () => {
  beforeEach(() => {
    resetPrivyMock();
  });

  test("gives grill no signer until Privy has a wallet", () => {
    privyMock.ready = true;

    const { result } = renderWithProvider((children) => (
      <PrivyGrillProvider>{children}</PrivyGrillProvider>
    ));

    expect(result.current.signer).toBeNull();
  });

  test("gives grill a signer for the user's Privy wallet", () => {
    privyMock.ready = true;
    privyMock.wallets = [{ address: MOCK_WALLET_ADDRESS }];

    const { result } = renderWithProvider((children) => (
      <PrivyGrillProvider>{children}</PrivyGrillProvider>
    ));

    expect(result.current.signer?.address).toBe(address(MOCK_WALLET_ADDRESS));
  });

  test("passes its wallet, chain, and options through to the signer", async () => {
    privyMock.ready = true;
    privyMock.wallets = [
      { address: MOCK_WALLET_ADDRESS },
      { address: MOCK_SECOND_WALLET_ADDRESS },
    ];

    const { result } = renderWithProvider((children) => (
      <PrivyGrillProvider
        address={MOCK_SECOND_WALLET_ADDRESS}
        chain="solana:devnet"
        options={{ sponsor: true }}
      >
        {children}
      </PrivyGrillProvider>
    ));

    const signer = result.current.signer;
    expect(signer?.address).toBe(address(MOCK_SECOND_WALLET_ADDRESS));

    await signer?.signAndSendTransactions([createTransaction()]);

    const input = privyMock.signAndSendTransaction.mock.calls[0]?.[0];
    expect(input?.wallet).toBe(privyMock.wallets[1]);
    expect(input?.chain).toBe("solana:devnet");
    expect(input?.options).toEqual({ sponsor: true });
  });
});
