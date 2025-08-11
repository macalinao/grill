import { useAccount, useKitWallet } from "@macalinao/grill";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaClient } from "gill-react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const SimpleDashboard: React.FC = () => {
  const { signer } = useKitWallet();
  const { rpc } = useSolanaClient();
  // Only fetch account if signer is available
  const accountQuery = useAccount({ address: signer ? signer.address : null });
  const [slot, setSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRefreshBalance = (): void => {
    if (!signer) {
      toast.error("Please connect your wallet first");
      return;
    }

    void accountQuery.refetch();
    toast.success("Balance refreshed");
  };

  const handleGetSlot = async (): Promise<void> => {
    setLoading(true);
    try {
      const currentSlot = await rpc.getSlot().send();
      setSlot(Number(currentSlot));
      toast.success(`Current slot: ${currentSlot.toString()}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Grill + Gill Example</h1>
          <WalletMultiButton />
        </div>

        {signer && (
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connected</CardTitle>
              <CardDescription>Address: {signer.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountQuery.isLoading ? (
                  <p className="text-lg">Loading balance...</p>
                ) : accountQuery.error ? (
                  <p className="text-lg text-red-500">Error loading balance</p>
                ) : accountQuery.data ? (
                  <p className="text-lg">
                    Balance: {Number(accountQuery.data.lamports) / 1e9} SOL
                  </p>
                ) : (
                  <p className="text-lg">Balance: 0 SOL</p>
                )}
                {slot !== null && (
                  <p className="text-lg">Current Slot: {slot}</p>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={handleRefreshBalance}
                    disabled={accountQuery.isLoading}
                  >
                    {accountQuery.isLoading ? "Loading..." : "Refresh Balance"}
                  </Button>
                  <Button
                    onClick={() => void handleGetSlot()}
                    disabled={loading}
                    variant="secondary"
                  >
                    Get Current Slot
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!signer && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                Connect your wallet to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This example demonstrates how to use the Grill library with:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                <li>SolanaClientProvider with gill's createSolanaClient</li>
                <li>
                  GrillProvider with React Query for reactive account fetching
                </li>
                <li>
                  useAccount hook for automatic balance loading and caching
                </li>
                <li>RPC calls using the gill client</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
