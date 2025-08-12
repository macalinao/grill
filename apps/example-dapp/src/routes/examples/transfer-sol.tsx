import {
  addressSchema,
  useAccount,
  useKitWallet,
  useSendTX,
} from "@macalinao/grill";
import type { Address } from "@solana/kit";
import { lamports } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { createFileRoute } from "@tanstack/react-router";
import { getExplorerLink } from "gill";
import { ArrowRight, Wallet } from "lucide-react";
import type * as React from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/examples/transfer-sol")({
  component: () => <TransferSolPage />,
});

interface TransferSolFormData {
  recipient: string;
  amount: string;
}

const TransferSolPage: React.FC = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  const { data: userAccount } = useAccount({
    address: signer?.address ?? null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
  } = useForm<TransferSolFormData>({
    defaultValues: {
      amount: "",
      recipient: "",
    },
  });

  const watchedAmount = watch("amount");

  const availableBalance = useMemo(() => {
    if (!userAccount) {
      return 0;
    }
    return Number(userAccount.lamports) / 1e9;
  }, [userAccount]);

  const estimatedFee = 0.000005; // ~5000 lamports

  const totalCost = useMemo(() => {
    const amount = Number.parseFloat(watchedAmount) || 0;
    return amount + estimatedFee;
  }, [watchedAmount]);

  const onSubmit = async (data: TransferSolFormData) => {
    if (!signer) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Validate recipient address using addressSchema
      const recipientResult = addressSchema.safeParse(data.recipient);
      if (!recipientResult.success) {
        setError("recipient", { message: "Invalid Solana address" });
        return;
      }
      const recipientAddress: Address = recipientResult.data;

      // Validate amount
      const amount = Number.parseFloat(data.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        setError("amount", { message: "Amount must be a positive number" });
        return;
      }
      if (amount > 1000) {
        setError("amount", { message: "Amount must be less than 1000 SOL" });
        return;
      }

      // Check balance
      if (totalCost > availableBalance) {
        toast.error("Insufficient balance for this transaction");
        return;
      }

      // Send native SOL
      const instruction = getTransferSolInstruction({
        source: signer,
        destination: recipientAddress,
        amount: lamports(BigInt(Math.floor(amount * 1e9))),
      });

      const signature = await sendTX(`Transfer ${amount.toString()} SOL`, [
        instruction,
      ]);

      if (signature) {
        toast.success("Transaction sent!", {
          description: `Transferred ${amount.toString()} SOL to ${recipientAddress.slice(0, 8)}...`,
          action: {
            label: "View on Explorer",
            onClick: () => {
              const explorerUrl = getExplorerLink({
                transaction: signature,
                cluster: "mainnet",
              });
              window.open(explorerUrl, "_blank");
            },
          },
        });

        // Clear form
        setValue("recipient", "");
        setValue("amount", "");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Transaction failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  if (!signer) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-lg">Please connect your wallet to continue</p>
              <p className="text-sm text-muted-foreground">
                You need to connect a Solana wallet to transfer SOL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Transfer SOL</CardTitle>
          <CardDescription>
            Send native SOL to another Solana address. Recipient addresses are
            validated using @macalinao/zod-solana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Recipient Address
              </label>
              <Input
                id="recipient"
                placeholder="Enter Solana address (e.g., 11111111111111111111111111111111)"
                {...register("recipient", {
                  required: "Recipient is required",
                })}
                className={errors.recipient ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.recipient && (
                <p className="text-sm text-destructive">
                  {errors.recipient.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Address validation powered by @macalinao/zod-solana
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount (SOL)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const maxAmount = Math.max(
                      0,
                      availableBalance - estimatedFee,
                    );
                    setValue("amount", maxAmount.toFixed(9));
                  }}
                  className="text-xs text-primary hover:underline"
                  disabled={isSubmitting}
                >
                  MAX: {Math.max(0, availableBalance - estimatedFee).toFixed(4)}{" "}
                  SOL
                </button>
              </div>
              <Input
                id="amount"
                type="text"
                placeholder="0.0"
                {...register("amount", { required: "Amount is required" })}
                className={errors.amount ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {watchedAmount && (
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Available Balance:
                  </span>
                  <span className="font-mono">
                    {availableBalance.toFixed(9)} SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount to Send:</span>
                  <span className="font-mono">
                    {Number.parseFloat(watchedAmount) || 0} SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Network Fee (est.):
                  </span>
                  <span className="font-mono">~{estimatedFee} SOL</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span
                    className={
                      totalCost > availableBalance
                        ? "text-destructive font-mono"
                        : "font-mono"
                    }
                  >
                    {totalCost.toFixed(9)} SOL
                  </span>
                </div>
                {totalCost > availableBalance && (
                  <p className="text-destructive text-xs mt-2">
                    Insufficient balance for this transaction
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting || !watchedAmount || totalCost > availableBalance
              }
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Transfer SOL
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Address:</span>
              <span className="font-mono text-xs">
                {signer.address.slice(0, 8)}...{signer.address.slice(-8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
