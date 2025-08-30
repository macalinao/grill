import type { Address } from "@solana/kit";
import type * as React from "react";
import { useMintAccount, useTokenInfo } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/examples/tokens")({
  component: TokensPage,
});

// Define token mint addresses
const TOKENS = [
  address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
  address("So11111111111111111111111111111111111111112"), // Wrapped SOL
  address("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"), // Jupiter
  address("METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m"), // META
  address("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"), // Bonk
];

interface TokenCardProps {
  mint: Address;
}

const TokenCard: React.FC<TokenCardProps> = ({ mint }) => {
  const { data: mintAccount, isLoading: mintLoading } = useMintAccount({
    address: mint,
  });
  const { data: tokenInfo, isLoading: infoLoading } = useTokenInfo({ mint });

  const name = tokenInfo?.name;
  const symbol = tokenInfo?.symbol;
  const decimals = tokenInfo?.decimals ?? mintAccount?.data.decimals ?? 0;
  const supply = mintAccount?.data.supply;

  const formatSupply = (supply: bigint | undefined, decimals: number) => {
    if (!supply) {
      return "—";
    }
    const divisor = BigInt(10 ** decimals);
    const whole = supply / divisor;
    const remainder = supply % divisor;

    // Format with thousands separators
    const wholeFormatted = whole.toLocaleString("en-US");

    // For very large supplies, show in abbreviated form
    if (whole > BigInt(1000000000)) {
      const billions = Number(whole) / 1000000000;
      return `${billions.toFixed(2)}B`;
    }
    if (whole > BigInt(1000000)) {
      const millions = Number(whole) / 1000000;
      return `${millions.toFixed(2)}M`;
    }

    // For smaller amounts, show some decimals
    if (remainder > 0 && whole < BigInt(1000000)) {
      const decimalPart = remainder
        .toString()
        .padStart(decimals, "0")
        .slice(0, 2);
      return `${wholeFormatted}.${decimalPart}`;
    }

    return wholeFormatted;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {tokenInfo?.iconURL ? (
              <img
                src={tokenInfo.iconURL}
                alt={symbol}
                className="h-10 w-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Coins className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">
                {infoLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  (name ?? "Unknown Token")
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {infoLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  (symbol ?? "—")
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Mint Address</p>
            <p className="font-mono text-xs break-all">{mint}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Decimals</p>
            <p className="font-medium">
              {mintLoading ? <Skeleton className="h-4 w-8" /> : decimals}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Total Supply</p>
            <p className="text-lg font-medium">
              {mintLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                formatSupply(supply, decimals)
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function TokensPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Token Information</h1>
        <p className="text-muted-foreground mt-2">
          View detailed information about popular Solana tokens including their
          total supply, decimals, and metadata.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {TOKENS.map((mint) => (
          <TokenCard key={mint} mint={mint} />
        ))}
      </div>
    </div>
  );
}
