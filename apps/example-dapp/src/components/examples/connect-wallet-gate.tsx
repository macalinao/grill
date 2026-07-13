import type * as React from "react";
import { useKitWallet } from "@macalinao/grill";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ConnectWalletGateProps {
  /** What the wallet is needed for, e.g. "send a transaction". */
  reason: string;
  children: React.ReactNode;
}

/**
 * Renders `children` only when a wallet is connected, otherwise shows a
 * connect-wallet prompt. Reads the signer from grill's `useKitWallet`.
 */
export const ConnectWalletGate: React.FC<ConnectWalletGateProps> = ({
  reason,
  children,
}) => {
  const { signer } = useKitWallet();

  if (!signer) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Connect your wallet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                A connected wallet is required to {reason}.
              </p>
            </div>
            <WalletMultiButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
