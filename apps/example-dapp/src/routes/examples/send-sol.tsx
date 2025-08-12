import {
  addressSchema,
  useAccount,
  useKitWallet,
  useSendTX,
} from "@macalinao/grill";
import { createFileRoute } from "@tanstack/react-router";
import { getExplorerLink } from "gill";
import { Send } from "lucide-react";
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

// Form validation schema
const sendSOLSchema = z.object({
  recipient: addressSchema,
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num > 0;
    }, "Amount must be a positive number")
    .refine((val) => {
      const num = Number.parseFloat(val);
      return num <= 1000; // Reasonable upper limit for safety
    }, "Amount must be less than 1000 SOL"),
});

type SendSOLFormData = z.infer<typeof sendSOLSchema>;

const SendSOLPage: React.FC = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  const { data: userAccount } = useAccount({
    address: signer ? signer.address : null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<SendSOLFormData>({
    defaultValues: {
      recipient: "",
      amount: "",
    },
  });

  const watchedAmount = watch("amount");

  // Calculate available SOL balance
  const solBalance = useMemo(() => {
    if (!userAccount) {
      return "0";
    }
    return (Number(userAccount.lamports.toString()) / 1e9).toString();
  }, [userAccount]);

  const availableBalance = Number.parseFloat(solBalance);
  const requestedAmount = Number.parseFloat(watchedAmount || "0");

  // Handle form submission
  const onSubmit = async (data: SendSOLFormData): Promise<void> => {
    if (!signer) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Validate the form data using Zod
      const validatedData = sendSOLSchema.parse(data);

      // Convert amount to lamports (1 SOL = 1e9 lamports)
      const lamportAmount = BigInt(
        Math.floor(Number.parseFloat(validatedData.amount) * 1e9),
      );

      // Create a system transfer instruction
      const { getTransferSolInstruction } = await import(
        "@solana-program/system"
      );

      const transferInstruction = getTransferSolInstruction({
        source: signer,
        destination: validatedData.recipient,
        amount: lamportAmount,
      });

      // Send the transaction
      const signature = await sendTX(`Send ${validatedData.amount} SOL`, [
        transferInstruction,
      ]);

      // Show success message with explorer link
      const explorerLink = getExplorerLink({
        transaction: signature,
        cluster: "mainnet",
      });

      toast.success("SOL sent successfully!", {
        description: `Sent ${validatedData.amount} SOL to ${validatedData.recipient.slice(0, 8)}...`,
        action: {
          label: "View Transaction",
          onClick: () => {
            window.open(explorerLink, "_blank");
          },
        },
      });

      // Reset the form
      reset();
    } catch (error) {
      console.error("Error sending SOL:", error);
      // Error toast is already handled by useSendTX
    }
  };

  if (!signer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Send SOL</h1>
          <p className="text-muted-foreground">
            Transfer SOL to another Solana address
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>
              Please connect your wallet to send SOL
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send SOL</h1>
        <p className="text-muted-foreground">
          Transfer SOL to another Solana address
        </p>
      </div>

      {/* Balance Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {availableBalance.toFixed(4)} SOL
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ ${(availableBalance * 100).toFixed(2)} USD
          </div>
        </CardContent>
      </Card>

      {/* Send SOL Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send SOL</span>
          </CardTitle>
          <CardDescription>
            Enter the recipient address and amount to transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            className="space-y-4"
          >
            {/* Recipient Address Field */}
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Recipient Address
              </label>
              <Input
                id="recipient"
                placeholder="Enter Solana address (e.g., 11111111111111111111111111111111)"
                {...register("recipient")}
                className={errors.recipient ? "border-red-500" : ""}
              />
              {errors.recipient && (
                <p className="text-sm text-red-500">
                  {errors.recipient.message}
                </p>
              )}
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (SOL)
              </label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.000000001"
                  min="0"
                  max={availableBalance}
                  placeholder="0.00"
                  {...register("amount")}
                  className={errors.amount ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                  onClick={() => {
                    // Set to max available balance minus a small amount for fees
                    const maxAmount = Math.max(0, availableBalance - 0.001);
                    const form = document.getElementById(
                      "amount",
                    ) as HTMLInputElement | null;
                    if (form) {
                      form.value = maxAmount.toString();
                      form.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                  }}
                >
                  MAX
                </Button>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
              {requestedAmount > availableBalance && (
                <p className="text-sm text-red-500">
                  Insufficient balance. You have {availableBalance.toFixed(4)}{" "}
                  SOL available.
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                Available: {availableBalance.toFixed(4)} SOL
              </div>
            </div>

            {/* Transaction Summary */}
            {requestedAmount > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="text-sm font-medium">Transaction Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>{requestedAmount.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network fee:</span>
                    <span>~0.000005 SOL</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-medium">
                    <span>Total:</span>
                    <span>{(requestedAmount + 0.000005).toFixed(6)} SOL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !watchedAmount ||
                requestedAmount <= 0 ||
                requestedAmount > availableBalance ||
                !!errors.recipient ||
                !!errors.amount
              }
              className="w-full"
            >
              {isSubmitting
                ? "Sending..."
                : `Send ${requestedAmount.toFixed(4)} SOL`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Double-check the recipient address before sending. SOL transfers
                are irreversible.
              </li>
              <li>
                Network fees are automatically calculated and added to your
                transaction.
              </li>
              <li>Keep some SOL in your wallet for future transaction fees.</li>
              <li>
                Transactions typically confirm within 1-2 seconds on Solana.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/examples/send-sol")({
  component: SendSOLPage,
});
