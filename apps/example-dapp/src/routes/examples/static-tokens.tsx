import type { TokenInfo } from "@macalinao/grill";
import type { Address } from "@solana/kit";
import type * as React from "react";
import { useTokenInfo } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Coins, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/examples/static-tokens")({
  component: StaticTokensPage,
});

// Example static token info - in production, this could come from a config file
// or be fetched once at startup and cached
const STATIC_TOKEN_INFO: TokenInfo[] = [
  {
    mint: address("AZzE3wPJtVZ8H7nHyBxB4Wq4e17bEz7W3Eb1v4C4pX8D"),
    name: "Static Test Token",
    symbol: "STT",
    decimals: 9,
    iconURL:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    mint: address("AZzE3wPJtVZ8H7nHyBxB4Wq4e17bEz7W3Eb1v4C4pX8E"),
    name: "Another Static Token",
    symbol: "AST",
    decimals: 6,
  },
];

// Real tokens to compare against
const REAL_TOKENS = [
  address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
  address("So11111111111111111111111111111111111111112"), // Wrapped SOL
];

interface TokenCardProps {
  mint: Address;
  isStatic?: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ mint, isStatic = false }) => {
  const { data: tokenInfo, isLoading } = useTokenInfo({ mint });

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {tokenInfo?.iconURL ? (
              <img
                src={tokenInfo.iconURL}
                alt={tokenInfo.symbol}
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
                {isLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  (tokenInfo?.name ?? "Unknown Token")
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  (tokenInfo?.symbol ?? "—")
                )}
              </CardDescription>
            </div>
          </div>
          {isStatic && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
              Static
            </span>
          )}
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
              {isLoading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                (tokenInfo?.decimals ?? "—")
              )}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Load Time</p>
            <p className="text-sm">
              {isStatic
                ? "Instant (from static config)"
                : isLoading
                  ? "Loading from chain..."
                  : "Loaded from chain"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function StaticTokensPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Static Token Information</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating how static token info can be preloaded for instant
          display without fetching from chain.
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>How Static Token Info Works</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            Static token info can be passed to GrillProvider as an array:
          </p>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
            {`<GrillProvider 
  staticTokenInfo={[
    {
      mint: address("11111111111111111111111111111111"),
      name: "Static Test Token",
      symbol: "STT",
      decimals: 9,
      iconURL: "https://example.com/icon.png"
    }
  ]}
>
  {children}
</GrillProvider>`}
          </pre>
          <p className="mt-2">
            When useTokenInfo is called with a mint that exists in
            staticTokenInfo, it returns instantly without fetching from chain.
            This is useful for:
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Known tokens where you want instant display</li>
            <li>Custom tokens not yet deployed</li>
            <li>Overriding on-chain metadata with corrected info</li>
            <li>Reducing RPC calls for frequently used tokens</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Static Tokens (Would Load Instantly)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            These tokens would normally be configured in GrillProvider's
            staticTokenInfo prop. They would load instantly without any chain
            fetching.
          </p>
          <div className="flex flex-col gap-4">
            {STATIC_TOKEN_INFO.map((token) => (
              <TokenCard key={token.mint} mint={token.mint} isStatic />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">
            Real Tokens (Fetched from Chain)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            These tokens are fetched from the chain, requiring RPC calls to get
            their metadata.
          </p>
          <div className="flex flex-col gap-4">
            {REAL_TOKENS.map((mint) => (
              <TokenCard key={mint} mint={mint} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
