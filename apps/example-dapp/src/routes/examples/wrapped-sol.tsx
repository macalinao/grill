import {
  useAccount,
  useAssociatedTokenAccount,
  useKitWallet,
  useSendTX,
} from "@macalinao/grill";
import { createFileRoute } from "@tanstack/react-router";
import { getExplorerLink } from "gill";
import { ArrowDownUp } from "lucide-react";
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
  getUnwrapSOLInstructions,
  getWrapSOLInstructions,
  WSOL_MINT,
} from "@/utils/wrap-sol";

const WrappedSOLPage: FC = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  const { data: userAccount, refetch: refetchUserAccount } = useAccount({
    address: signer ? signer.address : null,
  });

  // State for wrap/unwrap amounts
  const [wrapAmount, setWrapAmount] = useState("");
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const [isWrapping, setIsWrapping] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  // Get the wSOL ATA address and account data using the combined hook
  const { data: wsolTokenAccount, refetch: refetchWsolAccount } =
    useAssociatedTokenAccount({
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
    console.log({ wsolTokenAccount });
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

      toast.success(`Successfully wrapped ${wrapAmount} SOL!`);

      // Show explorer link
      const explorerLink = getExplorerLink({
        transaction: signature,
        cluster: "mainnet",
      });
      console.log("Transaction:", explorerLink);

      setWrapAmount("");

      // Refresh balances
      void refetchUserAccount();
      void refetchWsolAccount();
    } catch (error) {
      console.error("Error wrapping SOL:", error);
      // Error already handled by sendTX toast
    } finally {
      setIsWrapping(false);
    }
  };

  // Handle unwrap wSOL action
  const handleUnwrapSOL = async () => {
    if (!(signer && unwrapAmount) || Number.parseFloat(unwrapAmount) <= 0) {
      toast.error("Invalid unwrap amount");
      return;
    }

    const availableWSOL = Number.parseFloat(wsolBalance);
    if (Number.parseFloat(unwrapAmount) > availableWSOL) {
      toast.error("Insufficient wSOL balance");
      return;
    }

    setIsUnwrapping(true);
    try {
      // Get the unwrap instructions
      const instructions = await getUnwrapSOLInstructions(signer);

      // Send the transaction using useSendTX
      const signature = await sendTX(
        `Unwrap ${unwrapAmount} wSOL`,
        instructions,
      );

      toast.success(`Successfully unwrapped ${unwrapAmount} wSOL!`);

      // Show explorer link
      const explorerLink = getExplorerLink({
        transaction: signature,
        cluster: "mainnet",
      });
      console.log("Transaction:", explorerLink);

      setUnwrapAmount("");

      // Refresh balances
      void refetchUserAccount();
      void refetchWsolAccount();
    } catch (error) {
      console.error("Error unwrapping wSOL:", error);
      // Error already handled by sendTX toast
    } finally {
      setIsUnwrapping(false);
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
          <h1 className="text-2xl font-bold">Wrap & Unwrap SOL</h1>
          <p className="text-muted-foreground">
            Convert between native SOL and wrapped SOL (wSOL) tokens
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>
              Please connect your wallet to wrap and unwrap SOL tokens
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wrap & Unwrap SOL</h1>
        <p className="text-muted-foreground">
          Convert between native SOL and wrapped SOL (wSOL) tokens
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        {/* Unwrap wSOL Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Unwrap wSOL</span>
              <ArrowDownUp className="w-4 h-4" />
            </CardTitle>
            <CardDescription>
              Convert wrapped SOL (wSOL) tokens back to native SOL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">From</div>
              <InputTokenAmount
                token={wsolToken}
                value={unwrapAmount}
                onChange={setUnwrapAmount}
                maxAmount={wsolBalance}
                placeholder="0.00"
              />
              <div className="text-xs text-muted-foreground">
                Available: {Number.parseFloat(wsolBalance).toFixed(4)} wSOL
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
                  {solToken.icon && (
                    <img
                      src={solToken.icon}
                      alt={solToken.symbol}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-xl font-medium">
                    {calculateReceiveAmount(unwrapAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{solToken.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {solToken.name}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => void handleUnwrapSOL()}
              disabled={
                !unwrapAmount ||
                Number.parseFloat(unwrapAmount) <= 0 ||
                Number.parseFloat(unwrapAmount) >
                  Number.parseFloat(wsolBalance) ||
                isUnwrapping
              }
              className="w-full"
              variant="outline"
            >
              {isUnwrapping ? "Unwrapping..." : "Unwrap wSOL"}
            </Button>
          </CardContent>
        </Card>
      </div>

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
                Unwrapping closes the token account and returns native SOL
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
