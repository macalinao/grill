import type { FC, ReactNode } from "react";
import type { UsePrivySignerOptions } from "../hooks/use-privy-signer.js";
import { WalletProvider } from "@macalinao/grill";
import { usePrivySigner } from "../hooks/use-privy-signer.js";

export interface PrivyGrillProviderProps extends UsePrivySignerOptions {
  children: ReactNode;
}

/**
 * Wires the user's Privy Solana wallet into grill.
 *
 * Renders grill's `WalletProvider` with a signer built from Privy, so every
 * grill hook -- `useSendTX`, `useConnectedWallet`, and friends -- transparently
 * signs and sends through the user's embedded wallet. The signer is `null`
 * until Privy is ready and the user has a wallet.
 *
 * Place this inside Privy's `PrivyProvider` and *outside* grill's
 * `GrillProvider`, which reads the signer from the wallet context this provider
 * supplies.
 *
 * @example
 * ```tsx
 * <PrivyProvider appId={appId}>
 *   <PrivyGrillProvider chain="solana:mainnet">
 *     <GrillProvider>
 *       <App />
 *     </GrillProvider>
 *   </PrivyGrillProvider>
 * </PrivyProvider>
 * ```
 */
export const PrivyGrillProvider: FC<PrivyGrillProviderProps> = ({
  children,
  ...signerOptions
}) => {
  const signer = usePrivySigner(signerOptions);

  return <WalletProvider signer={signer}>{children}</WalletProvider>;
};
