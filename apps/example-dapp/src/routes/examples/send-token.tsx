import {
  addressSchema,
  useAccount,
  useKitWallet,
  useSendTX,
} from "@macalinao/grill";
import { lamports } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { createFileRoute } from "@tanstack/react-router";
import { getExplorerLink } from "gill";
import { ArrowRightLeft } from "lucide-react";
import type * as React from "react";
import { useMemo, useState } from "react";
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

export const Route = createFileRoute("/examples/send-token")({
  component: () => <SendTokenPage />,
});

// Form validation schema using addressSchema from zod-solana
interface SendTokenFormData {
  recipient: string; // Will be validated and transformed to Address
  amount: string;
  tokenType: "SOL" | "USDC" | "CUSTOM";
}

const SendTokenPage: React.FC = () => {
  const { signer } = useKitWallet();
  const sendTX = useSendTX();
  const [tokenType, setTokenType] = useState("SOL");

  const { data: userAccount } = useAccount({
    address: signer?.address ?? null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SendTokenFormData>({
    defaultValues: {
      amount: "",
      tokenType: "SOL",
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
    return tokenType === "SOL" ? amount + estimatedFee : estimatedFee;
  }, [watchedAmount, tokenType]);

  const onSubmit = async (data: SendTokenFormData) => {
    if (!signer) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Validate recipient address using addressSchema
      const recipientResult = addressSchema.safeParse(data.recipient);
      if (!recipientResult.success) {
        toast.error("Invalid Solana address");
        return;
      }
      const recipientAddress = recipientResult.data;

      const amount = Number.parseFloat(data.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        toast.error("Amount must be a positive number");
        return;
      }

      if (data.tokenType === "SOL") {
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

        const signature = await sendTX(`Send ${amount.toString()} SOL`, [
          instruction,
        ]);

        if (signature) {
          toast.success("Transaction sent!", {
            description: `Sent ${amount.toString()} SOL to ${recipientAddress.slice(0, 8)}...`,
            action: {
              label: "View",
              onClick: () => {
                const link = getExplorerLink({
                  transaction: signature,
                  cluster: "mainnet",
                });
                window.open(link, "_blank");
              },
            },
          });
        }
      } else {
        // Placeholder for SPL token transfers
        toast.info("SPL token transfers coming soon!", {
          description:
            "This example demonstrates address validation with @macalinao/zod-solana. Full SPL token support will be added in a future update.",
        });
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Send Token Example</h1>
        <p className="text-muted-foreground mt-2">
          Transfer SOL or SPL tokens with address validation from
          @macalinao/zod-solana
        </p>
      </div>

      {!signer ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to send tokens
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Send Tokens</CardTitle>
            <CardDescription>
              Transfer tokens to another Solana address. The recipient address
              is validated using the addressSchema from @macalinao/zod-solana.
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
                <label htmlFor="tokenType" className="text-sm font-medium">
                  Token Type
                </label>
                <select
                  id="tokenType"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={tokenType}
                  onChange={(e) => {
                    setTokenType(e.target.value);
                    setValue(
                      "tokenType",
                      e.target.value as "SOL" | "USDC" | "CUSTOM",
                    );
                  }}
                >
                  <option value="SOL">SOL (Native)</option>
                  <option value="USDC">USDC (Coming Soon)</option>
                  <option value="CUSTOM">Custom Token (Coming Soon)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Address
                </label>
                <Input
                  id="recipient"
                  placeholder="Enter Solana address (e.g., 11111111111111111111111111111111)"
                  {...register("recipient")}
                  className={errors.recipient ? "border-destructive" : ""}
                />
                {errors.recipient && (
                  <p className="text-sm text-destructive">
                    {errors.recipient.message ?? "Invalid Solana address"}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Address validation powered by @macalinao/zod-solana
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount ({tokenType})
                  </label>
                  {tokenType === "SOL" && (
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
                    >
                      MAX:{" "}
                      {Math.max(0, availableBalance - estimatedFee).toFixed(4)}{" "}
                      SOL
                    </button>
                  )}
                </div>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.0"
                  {...register("amount")}
                  className={errors.amount ? "border-destructive" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {tokenType === "SOL" && watchedAmount && (
                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Available Balance:
                    </span>
                    <span>{availableBalance.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Amount to Send:
                    </span>
                    <span>{Number.parseFloat(watchedAmount) || 0} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Transaction Fee:
                    </span>
                    <span>~{estimatedFee} SOL</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span>{totalCost.toFixed(9)} SOL</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !signer}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Send {tokenType}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Address Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              @macalinao/zod-solana Integration
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              This example demonstrates the use of the{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                addressSchema
              </code>{" "}
              from @macalinao/zod-solana:
            </p>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
              {`import { addressSchema } from "@macalinao/grill";
import { z } from "zod";

const schema = z.object({
  recipient: addressSchema, // Validates Solana addresses
  amount: z.string().min(1),
  tokenType: z.enum(["SOL", "USDC", "CUSTOM"])
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Validates base58 encoding</li>
              <li>Checks for proper Solana address format</li>
              <li>Transforms valid strings to Address type from @solana/kit</li>
              <li>Provides helpful error messages for invalid addresses</li>
              <li>Compatible with both Zod v3 and v4</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">SPL Token Support</h3>
            <p className="text-sm text-muted-foreground">
              While this example currently implements SOL transfers, the form
              structure demonstrates how to extend it for SPL tokens. Full SPL
              token support would require additional logic for token accounts
              and the @solana-program/token library.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendTokenPage;
