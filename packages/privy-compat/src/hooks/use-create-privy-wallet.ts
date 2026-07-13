import type { Address } from "@solana/kit";
import { useCreateWallet } from "@privy-io/react-auth/solana";
import { address } from "@solana/kit";
import { useEffect, useMemo, useRef } from "react";

/**
 * Options accepted by Privy's `createWallet`, e.g. `createAdditional` to give a
 * user a second embedded wallet.
 */
export type CreatePrivyWalletOptions = Parameters<
  ReturnType<typeof useCreateWallet>["createWallet"]
>[0];

export interface UseCreatePrivyWalletResult {
  /**
   * Creates an embedded Solana wallet for the authenticated user.
   *
   * @param options - Privy wallet creation options.
   * @returns The new wallet's address, as a Kit {@link Address}.
   */
  createWallet: (options?: CreatePrivyWalletOptions) => Promise<Address>;
}

/**
 * Creates an embedded Solana wallet for the currently authenticated Privy user.
 *
 * This wraps Privy's `useCreateWallet` so the new wallet comes back as a Kit
 * {@link Address}, ready to hand to grill's hooks. Once the wallet exists,
 * {@link usePrivySigner} picks it up and grill can sign with it.
 *
 * Privy throws if the user is not authenticated, if they already have an
 * embedded wallet and `createAdditional` is not set, or if they abandon the
 * flow -- those errors propagate to the caller unchanged.
 *
 * Must be called inside Privy's `PrivyProvider`.
 *
 * @returns The `createWallet` function, stable across renders.
 *
 * @example
 * ```tsx
 * const { createWallet } = useCreatePrivyWallet();
 *
 * const onClick = async () => {
 *   const walletAddress = await createWallet();
 *   console.log("created", walletAddress);
 * };
 * ```
 */
export function useCreatePrivyWallet(): UseCreatePrivyWalletResult {
  const { createWallet } = useCreateWallet();

  // Privy returns a new `createWallet` closure on every render; the ref keeps
  // the function this hook hands out stable.
  const createWalletRef = useRef(createWallet);
  useEffect(() => {
    createWalletRef.current = createWallet;
  }, [createWallet]);

  return useMemo(
    () => ({
      createWallet: async (
        options?: CreatePrivyWalletOptions,
      ): Promise<Address> => {
        const { wallet } = await createWalletRef.current(options);
        return address(wallet.address);
      },
    }),
    [],
  );
}
