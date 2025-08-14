import { zodResolver } from "@hookform/resolvers/zod";
import {
  addressSchema,
  type TokenInfo,
  useAccount,
  useKitWallet,
  useSendTX,
} from "@macalinao/grill";
import type { Address } from "@solana/kit";
import { address, lamports } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Wallet } from "lucide-react";
import type * as React from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputTokenAmount } from "@/components/ui/input-token-amount";

export const Route = createFileRoute("/examples/transfer-sol")({
  component: () => <TransferSolPage />,
});

// Define the form schema using zod with addressSchema directly
const transferSolSchema = z.object({
  recipient: addressSchema,
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num > 0;
      },
      { message: "Amount must be a positive number" },
    )
    .refine(
      (val) => {
        const num = Number.parseFloat(val);
        return num <= 1000;
      },
      { message: "Amount must be less than 1000 SOL" },
    ),
});

const TransferSolPage: React.FC = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();

  const { data: userAccount } = useAccount({
    address: signer?.address ?? null,
  });

  // SOL token info
  const solToken: TokenInfo = {
    mint: address("11111111111111111111111111111111"),
    symbol: "SOL",
    decimals: 9,
    name: "Solana",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(transferSolSchema),
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

  const onSubmit = async (data: z.infer<typeof transferSolSchema>) => {
    if (!signer) {
      toast.error("Please connect your wallet first");
      return;
    }

    // The recipient is already an Address type from the zod schema
    const recipientAddress: Address = data.recipient;
    const amount = Number.parseFloat(data.amount);

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
      // Clear form after successful transaction
      reset();
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
            Send native SOL to another Solana address. Form validation is
            handled by Zod schema with @macalinao/zod-solana for address
            validation.
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
                {...register("recipient")}
                className={errors.recipient ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.recipient && (
                <p className="text-sm text-destructive">
                  {errors.recipient.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Address validation using @macalinao/zod-solana with zodResolver
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount to Send
              </label>
              <InputTokenAmount
                token={solToken}
                value={watch("amount")}
                onChange={(value) => {
                  setValue("amount", value);
                }}
                maxAmount={Math.max(0, availableBalance - estimatedFee).toFixed(
                  9,
                )}
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
