import type { Pool } from "@macalinao/clients-meteora-damm-v2";
import { getPoolDecoder } from "@macalinao/clients-meteora-damm-v2";
import { useAccount, useTokenInfo } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Droplets, RefreshCw, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/examples/pool-subscription")({
  component: PoolSubscriptionPage,
});

// Meteora SOL-USDC DAMM v2 Pool
const SOL_USDC_POOL_ADDRESS = address(
  "8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie",
);

// Second Meteora Pool
const SECOND_POOL_ADDRESS = address(
  "BnztueWcXv93mgW7yJe8WYpnCxpz34nujPhfjQT6SLu1",
);

// Create the decoder once, outside the component
const poolDecoder = getPoolDecoder();

/**
 * Calculate price from sqrt price
 * sqrtPrice is stored as a Q64.64 fixed-point number
 */
function sqrtPriceToPrice(sqrtPrice: bigint): number {
  // sqrtPrice is in Q64.64 format
  // To get the actual sqrt price, we divide by 2^64
  // Then square it to get the price
  const sqrtPriceFloat = Number(sqrtPrice) / 2 ** 64;
  return sqrtPriceFloat * sqrtPriceFloat;
}

/**
 * Format a bigint as a human readable number with decimals
 */
function formatBigInt(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  // Pad fractional part with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");

  // Trim trailing zeros but keep at least 2 decimal places
  const trimmed = fractionalStr.replace(/0+$/, "").padEnd(2, "0");

  return `${integerPart.toLocaleString()}.${trimmed}`;
}

const PoolDataDisplay: React.FC<{ pool: Pool }> = ({ pool }) => {
  // Fetch token info for both mints
  const tokenAInfo = useTokenInfo({ mint: pool.tokenAMint });
  const tokenBInfo = useTokenInfo({ mint: pool.tokenBMint });

  const price = useMemo(() => sqrtPriceToPrice(pool.sqrtPrice), [pool]);

  const tokenASymbol = tokenAInfo.data?.symbol ?? "Token A";
  const tokenBSymbol = tokenBInfo.data?.symbol ?? "Token B";

  return (
    <div className="space-y-4">
      {/* Price Card */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Current Price</span>
        </div>
        <div className="mt-1 text-3xl font-bold">
          {price.toFixed(6)} {tokenBSymbol}/{tokenASymbol}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          1 {tokenASymbol} = {price.toFixed(6)} {tokenBSymbol}
        </div>
      </div>

      {/* Pool Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Token A</div>
          <div className="font-medium">{tokenASymbol}</div>
          <div className="font-mono text-xs text-muted-foreground">
            {pool.tokenAMint.slice(0, 8)}...
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Token B</div>
          <div className="font-medium">{tokenBSymbol}</div>
          <div className="font-mono text-xs text-muted-foreground">
            {pool.tokenBMint.slice(0, 8)}...
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4" />
            <span>Liquidity</span>
          </div>
          <div className="font-mono text-lg font-medium">
            {formatBigInt(pool.liquidity, 6)}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Pool Status</div>
          <div className="font-medium">
            {pool.poolStatus === 0 ? (
              <span className="text-green-600">Active</span>
            ) : (
              <span className="text-red-600">Disabled</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Protocol Fee A</div>
          <div className="font-mono font-medium">
            {formatBigInt(pool.protocolAFee, 6)}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Protocol Fee B</div>
          <div className="font-mono font-medium">
            {formatBigInt(pool.protocolBFee, 6)}
          </div>
        </div>
      </div>

      {/* Raw sqrt price for debugging */}
      <div className="rounded-lg border bg-muted/50 p-3">
        <div className="text-sm text-muted-foreground">
          Raw sqrtPrice (Q64.64)
        </div>
        <div className="font-mono text-xs break-all">
          {pool.sqrtPrice.toString()}
        </div>
      </div>
    </div>
  );
};

function PoolSubscriptionPage() {
  // Fetch pool data with real-time subscription
  const {
    data: pool,
    isLoading,
    error,
    dataUpdatedAt,
  } = useAccount({
    address: SOL_USDC_POOL_ADDRESS,
    decoder: poolDecoder,
    subscribeToUpdates: true,
  });

  // Fetch second pool data with real-time subscription
  const {
    data: secondPool,
    isLoading: isLoadingSecond,
    error: errorSecond,
    dataUpdatedAt: dataUpdatedAtSecond,
  } = useAccount({
    address: SECOND_POOL_ADDRESS,
    decoder: poolDecoder,
    subscribeToUpdates: true,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Real-time Pool Subscription</h1>
        <p className="mt-2 text-muted-foreground">
          Demonstrates using{" "}
          <code className="font-mono">subscribeToUpdates</code> to receive
          real-time updates from a Meteora DAMM v2 pool via WebSocket.
        </p>
      </div>

      <div className="space-y-6">
        {/* Explanation Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">How it works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This page subscribes to the Meteora SOL-USDC pool at{" "}
              <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">
                {SOL_USDC_POOL_ADDRESS.slice(0, 16)}...
              </code>{" "}
              using a WebSocket connection. When any swap occurs on this pool,
              the price and other data will automatically update without
              requiring a page refresh or manual polling.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>De-duplicated subscriptions:</strong> Multiple
                  components subscribing to the same account share one WebSocket
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>Automatic cache updates:</strong> React Query cache is
                  updated when account changes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>Clean cleanup:</strong> Subscription is automatically
                  cleaned up when component unmounts
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Last Updated Indicators */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>
              SOL-USDC Pool:{" "}
              {dataUpdatedAt
                ? new Date(dataUpdatedAt).toLocaleTimeString()
                : "Never"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>
              Second Pool:{" "}
              {dataUpdatedAtSecond
                ? new Date(dataUpdatedAtSecond).toLocaleTimeString()
                : "Never"}
            </span>
          </div>
        </div>

        {/* Pool Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Meteora SOL-USDC Pool</CardTitle>
            <CardDescription>
              Real-time data from the DAMM v2 pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                Error loading pool: {error.message}
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ) : pool ? (
              <PoolDataDisplay pool={pool.data} />
            ) : (
              <div className="rounded-lg border p-4 text-center text-muted-foreground">
                Pool not found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Second Pool Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Meteora Pool</CardTitle>
            <CardDescription>
              Real-time data from pool {SECOND_POOL_ADDRESS.slice(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorSecond ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                Error loading pool: {errorSecond.message}
              </div>
            ) : isLoadingSecond ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ) : secondPool ? (
              <PoolDataDisplay pool={secondPool.data} />
            ) : (
              <div className="rounded-lg border p-4 text-center text-muted-foreground">
                Pool not found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Example Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
              <code>{`import { useAccount } from "@macalinao/grill";
import { getPoolDecoder } from "@macalinao/clients-meteora-damm-v2";
import { address } from "@solana/kit";

const poolDecoder = getPoolDecoder();

function PoolDisplay() {
  const { data: pool } = useAccount({
    address: address("8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie"),
    decoder: poolDecoder,
    subscribeToUpdates: true, // Enable real-time updates
  });

  return <div>Price: {pool?.data.sqrtPrice.toString()}</div>;
}`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
