import { beforeEach, describe, expect, mock, test } from "bun:test";
import { address } from "@solana/kit";
import { renderHook } from "@testing-library/react";
import {
  expectRejection,
  MOCK_SECOND_WALLET_ADDRESS,
  MOCK_WALLET_ADDRESS,
  privyMock,
  resetPrivyMock,
} from "../test-setup.js";
import { useCreatePrivyWallet } from "./use-create-privy-wallet.js";

describe("useCreatePrivyWallet", () => {
  beforeEach(() => {
    resetPrivyMock();
  });

  test("returns the new wallet's address as a Kit address", async () => {
    const { result } = renderHook(() => useCreatePrivyWallet());

    const walletAddress = await result.current.createWallet();

    expect(walletAddress).toBe(address(MOCK_WALLET_ADDRESS));
    expect(privyMock.createWallet).toHaveBeenCalledWith(undefined);
  });

  test("forwards options to Privy", async () => {
    const { result } = renderHook(() => useCreatePrivyWallet());

    await result.current.createWallet({ createAdditional: true });

    expect(privyMock.createWallet).toHaveBeenCalledWith({
      createAdditional: true,
    });
  });

  test("propagates Privy's error when creation fails", async () => {
    privyMock.createWallet = mock(() =>
      Promise.reject(new Error("User must be authenticated")),
    );
    const { result } = renderHook(() => useCreatePrivyWallet());

    const error = await expectRejection(result.current.createWallet());

    expect(error.message).toBe("User must be authenticated");
  });

  test("keeps createWallet stable across re-renders", () => {
    const { result, rerender } = renderHook(() => useCreatePrivyWallet());
    const { createWallet } = result.current;

    rerender();

    expect(result.current.createWallet).toBe(createWallet);
  });

  test("calls Privy's latest createWallet after a re-render", async () => {
    const { result, rerender } = renderHook(() => useCreatePrivyWallet());
    const { createWallet } = result.current;

    privyMock.createWallet = mock(() =>
      Promise.resolve({ wallet: { address: MOCK_SECOND_WALLET_ADDRESS } }),
    );
    rerender();

    expect(await createWallet()).toBe(address(MOCK_SECOND_WALLET_ADDRESS));
  });
});
