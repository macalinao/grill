import type { Address } from "@solana/kit";
import type * as React from "react";
import { useTokenInfo } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Coins, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/examples/fetch-stablecoins")({
  component: FetchStablecoinsPage,
});

// Popular stablecoin mint addresses on Solana
const STABLECOINS: { mint: Address; name: string; description: string }[] = [
  {
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    name: "USDC",
    description: "USD Coin - Circle's fully-backed dollar stablecoin",
  },
  {
    mint: address("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    name: "USDT",
    description: "Tether USD - The most widely used stablecoin",
  },
  {
    mint: address("7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"),
    name: "UXD",
    description: "UXD Protocol - Delta-neutral stablecoin",
  },
  {
    mint: address("AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3"),
    name: "FIDA (Bonfida USD)",
    description: "Bonfida's stablecoin",
  },
];

interface StablecoinCardProps {
  mint: Address;
  name: string;
  description: string;
}

const StablecoinCard: React.FC<StablecoinCardProps> = ({
  mint,
  name,
  description,
}) => {
  const { data: tokenInfo, isLoading, error } = useTokenInfo({ mint });

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
          Loading
        </span>
      );
    }
    if (error) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-200">
          Error
        </span>
      );
    }
    if (tokenInfo) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
          Loaded
        </span>
      );
    }
    return null;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {tokenInfo?.iconURL ? (
              <img
                src={tokenInfo.iconURL}
                alt={tokenInfo.symbol}
                className="h-12 w-12 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {isLoading ? (
                  <Skeleton className="h-12 w-12 rounded-full" />
                ) : (
                  <Coins className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  (tokenInfo?.name ?? name)
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  (tokenInfo?.symbol ?? "—")
                )}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Decimals</p>
              <p className="font-medium text-lg">
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  (tokenInfo?.decimals ?? "—")
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Has Icon</p>
              <p className="font-medium text-lg">
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : tokenInfo?.iconURL ? (
                  "✓ Yes"
                ) : (
                  "✗ No"
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-xs mb-1">Mint Address</p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs bg-muted p-2 rounded break-all flex-1">
                {mint}
              </code>
              <a
                href={`https://solscan.io/token/${mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {tokenInfo && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Fetched Token Info:
              </p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    name: tokenInfo.name,
                    symbol: tokenInfo.symbol,
                    decimals: tokenInfo.decimals,
                    iconURL: tokenInfo.iconURL,
                    mint: tokenInfo.mint,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to fetch token info: {String(error)}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function FetchStablecoinsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fetch Stablecoin Token Info</h1>
        <p className="text-muted-foreground mt-2">
          Example of fetching USDC, USDT, and other stablecoin token information
          using the useTokenInfo hook from grill.
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>How Token Fetching Works</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            The{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              useTokenInfo
            </code>{" "}
            hook fetches token information from multiple sources:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>First checks if the token is in the static token info cache</li>
            <li>Fetches the mint account to get decimals and supply</li>
            <li>Fetches the token metadata account (Metaplex standard)</li>
            <li>If metadata has a URI, fetches the off-chain JSON metadata</li>
            <li>Falls back to certified token lists if no metadata is found</li>
          </ol>
          <p className="mt-3 text-sm">Example usage:</p>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mt-2">
            {`import { useTokenInfo } from '@macalinao/grill';
import { address } from '@solana/kit';

// USDC mint address
const USDC_MINT = address(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

function MyComponent() {
  const { data: tokenInfo, isLoading } = useTokenInfo({ 
    mint: USDC_MINT 
  });
  
  return (
    <div>
      {isLoading ? "Loading..." : tokenInfo?.name}
    </div>
  );
}`}
          </pre>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {STABLECOINS.map((stablecoin) => (
          <StablecoinCard
            key={stablecoin.mint}
            mint={stablecoin.mint}
            name={stablecoin.name}
            description={stablecoin.description}
          />
        ))}
      </div>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Key Features</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Automatic Caching:</strong> Token info is cached using
              React Query to minimize RPC calls
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Multiple Data Sources:</strong> Fetches from on-chain
              metadata, URI JSON, and certified token lists
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Type Safe:</strong> Fully typed with TypeScript for better
              DX
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Loading States:</strong> Built-in loading and error states
              with React Query
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
