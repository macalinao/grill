import type { TokenInfo } from "@macalinao/token-utils";
import { GrillProvider, useTokenInfo } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/examples/preloaded-tokens")({
  component: PreloadedTokensExample,
});

// Example preloaded token info
const PRELOADED_TOKENS = new Map<string, TokenInfo>([
  [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    {
      mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    },
  ],
  [
    "So11111111111111111111111111111111111111112", // SOL
    {
      mint: address("So11111111111111111111111111111111111111112"),
      name: "Wrapped SOL",
      symbol: "SOL",
      decimals: 9,
      logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
  ],
]);

function TokenDisplay({ mint }: { mint: string }) {
  const { data: tokenInfo, isLoading } = useTokenInfo({
    mint: address(mint),
  });

  if (isLoading) {
    return <div>Loading token info...</div>;
  }

  if (!tokenInfo) {
    return <div>No token info available</div>;
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        {tokenInfo.logoURI && (
          <img
            src={tokenInfo.logoURI}
            alt={tokenInfo.name}
            className="h-10 w-10 rounded-full"
          />
        )}
        <div>
          <h3 className="font-semibold">{tokenInfo.name}</h3>
          <p className="text-sm text-muted-foreground">
            {tokenInfo.symbol} • {tokenInfo.decimals} decimals
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {mint.slice(0, 8)}...{mint.slice(-8)}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreloadedTokensExample() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Preloaded Tokens Example</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Without Preloaded Data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These tokens will fetch their info from the blockchain and metadata URIs
        </p>
        <div className="space-y-2">
          <TokenDisplay mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" />
          <TokenDisplay mint="So11111111111111111111111111111111111111112" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">With Preloaded Data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These tokens use preloaded info for instant display (no fetching)
        </p>
        <GrillProvider preloadedTokenInfo={PRELOADED_TOKENS}>
          <div className="space-y-2">
            <TokenDisplay mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" />
            <TokenDisplay mint="So11111111111111111111111111111111111111112" />
          </div>
        </GrillProvider>
      </div>
    </div>
  );
}