import {
  useAccount,
  useAssociatedTokenAccount,
  useKitWallet,
  useSendTX,
} from "@macalinao/grill";
import { createFileRoute } from "@tanstack/react-router";
import { getExplorerLink } from "gill";
import { ArrowDownUp, X } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputTokenAmount } from "@/components/ui/input-token-amount";
import type { TokenInfo } from "@/types/token";
import { formatTokenAmount } from "@/utils/format-token-amount";
import {
  getCloseAccountInstructions,
  getWrapSOLInstructions,
  WSOL_MINT,
} from "@/utils/wrap-sol";

const WrappedSOLPage: FC = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  const { data: userAccount } = useAccount({
    address: signer ? signer.address : null,
  });

  // State for wrap amount
  const [wrapAmount, setWrapAmount] = useState("");
  const [isWrapping, setIsWrapping] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Get the wSOL ATA address and account data using the combined hook
  const { data: wsolTokenAccount } = useAssociatedTokenAccount({
    mint: signer ? WSOL_MINT : null,
    owner: signer?.address,
  });

  // Token info definitions
  const solToken: TokenInfo = {
    address: "11111111111111111111111111111111", // Native SOL program ID
    symbol: "SOL",
    decimals: 9,
    name: "Solana",
    icon: "https://cryptologos.cc/logos/solana-sol-logo.png", // Using a CDN icon
  };

  const wsolToken: TokenInfo = {
    address: "So11111111111111111111111111111111111111112", // wSOL mint address
    symbol: "wSOL",
    decimals: 9,
    name: "Wrapped SOL",
    icon: "https://cryptologos.cc/logos/solana-sol-logo.png", // Same icon as SOL
  };

  // Calculate available balances
  const solBalance = useMemo(() => {
    if (!userAccount) {
      return "0";
    }
    return (Number(userAccount.lamports.toString()) / 1e9).toString();
  }, [userAccount]);

  // Calculate wSOL balance from token account
  const wsolBalance = useMemo(() => {
    if (!wsolTokenAccount) {
      return "0";
    }
    return formatTokenAmount(wsolTokenAccount.data.amount, 9);
  }, [wsolTokenAccount]);

  // Handle wrap SOL action
  const handleWrapSOL = async () => {
    if (!(signer && wrapAmount) || Number.parseFloat(wrapAmount) <= 0) {
      toast.error("Invalid wrap amount");
      return;
    }

    setIsWrapping(true);
    try {
      // Convert amount to lamports (1 SOL = 1e9 lamports)
      const lamportAmount = BigInt(
        Math.floor(Number.parseFloat(wrapAmount) * 1e9),
      );

      // Get the wrap instructions
      const instructions = await getWrapSOLInstructions(signer, lamportAmount);

      // Send the transaction using useSendTX
      const signature = await sendTX(`Wrap ${wrapAmount} SOL`, instructions);

      // Show explorer link
      const explorerLink = getExplorerLink({
        transaction: signature,
        cluster: "mainnet",
      });
      console.log("Transaction:", explorerLink);

      setWrapAmount("");
    } catch (error) {
      console.error("Error wrapping SOL:", error);
      // Error already handled by mutation
    } finally {
      setIsWrapping(false);
    }
  };

  // Handle close wSOL account action
  const handleCloseAccount = async () => {
    if (!signer) {
      return;
    }

    setIsClosing(true);
    try {
      // Get the close account instructions (this will also unwrap any remaining wSOL)
      const instructions = await getCloseAccountInstructions(signer);

      // Send the transaction using useSendTX
      const signature = await sendTX("Close wSOL Account", instructions);

      // Show explorer link
      const explorerLink = getExplorerLink({
        transaction: signature,
        cluster: "mainnet",
      });
      console.log("Transaction:", explorerLink);
    } catch (error) {
      console.error("Error closing wSOL account:", error);
      // Error already handled by mutation
    } finally {
      setIsClosing(false);
    }
  };

  // Calculate what you'll receive (1:1 conversion)
  const calculateReceiveAmount = (inputAmount: string) => {
    if (!inputAmount || inputAmount === "0") {
      return "0.00";
    }
    return Number.parseFloat(inputAmount).toFixed(2);
  };

  if (!signer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Wrapped SOL</h1>
          <p className="text-muted-foreground">
            Wrap SOL to wSOL tokens and manage your wrapped SOL account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>
              Please connect your wallet to wrap SOL and manage your wSOL
              account
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasWsolAccount = wsolTokenAccount && Number.parseFloat(wsolBalance) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wrapped SOL</h1>
        <p className="text-muted-foreground">
          Wrap SOL to wSOL tokens and manage your wrapped SOL account
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Native SOL Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number.parseFloat(solBalance).toFixed(4)} SOL
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wrapped SOL Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number.parseFloat(wsolBalance).toFixed(4)} wSOL
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wrap SOL Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Wrap SOL</span>
            <ArrowDownUp className="w-4 h-4" />
          </CardTitle>
          <CardDescription>
            Convert native SOL into wrapped SOL (wSOL) tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">From</div>
            <InputTokenAmount
              token={solToken}
              value={wrapAmount}
              onChange={setWrapAmount}
              maxAmount={solBalance}
              placeholder="0.00"
            />
            <div className="text-xs text-muted-foreground">
              Available: {Number.parseFloat(solBalance).toFixed(4)} SOL
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowDownUp className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">To</div>
            <div className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
              <div className="flex items-center space-x-2">
                {wsolToken.icon && (
                  <img
                    src={wsolToken.icon}
                    alt={wsolToken.symbol}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span className="text-xl font-medium">
                  {calculateReceiveAmount(wrapAmount)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{wsolToken.symbol}</div>
                <div className="text-xs text-muted-foreground">
                  {wsolToken.name}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => void handleWrapSOL()}
            disabled={
              !wrapAmount ||
              Number.parseFloat(wrapAmount) <= 0 ||
              Number.parseFloat(wrapAmount) > Number.parseFloat(solBalance) ||
              isWrapping
            }
            className="w-full"
          >
            {isWrapping ? "Wrapping..." : "Wrap SOL"}
          </Button>
        </CardContent>
      </Card>

      {/* Close Account Card */}
      {hasWsolAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Close wSOL Account</CardTitle>
            <CardDescription>
              Unwrap all wSOL back to native SOL and close the token account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      What happens when you close?
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        • All {Number.parseFloat(wsolBalance).toFixed(4)} wSOL
                        will be converted back to SOL
                      </li>
                      <li>• The token account will be closed</li>
                      <li>• Account rent (~0.002 SOL) will be reclaimed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => void handleCloseAccount()}
                disabled={isClosing}
                variant="destructive"
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                {isClosing ? "Closing Account..." : "Close wSOL Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Wrapped SOL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              Wrapped SOL (wSOL) is an SPL token that represents native SOL in a
              token format. This allows SOL to be used in SPL token programs and
              DeFi applications that require token accounts.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>1 SOL = 1 wSOL (always 1:1 conversion)</li>
              <li>Wrapping creates a token account with your SOL</li>
              <li>
                Closing the account unwraps all wSOL and returns native SOL
              </li>
              <li>wSOL can be used in any SPL token compatible application</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/examples/wrapped-sol")({
  component: WrappedSOLPage,
});
