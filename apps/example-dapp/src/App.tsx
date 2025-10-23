import type { TokenInfo } from "@macalinao/grill";
import type * as React from "react";
import { SolanaProvider } from "@gillsdk/react";
import { GrillProvider, getSolscanExplorerLink } from "@macalinao/grill";
import { WalletAdapterCompatProvider } from "@macalinao/wallet-adapter-compat";
import { address } from "@solana/kit";
import {
  ConnectionProvider,
  WalletProvider as WalletAdapterProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createSolanaClient, getPublicSolanaRpcUrl } from "gill";
import { useMemo } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider.js";
import { routeTree } from "./routeTree.gen.js";

// Create the router instance
const router = createRouter({ routeTree });

// Register the router instance for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

import "@solana/wallet-adapter-react-ui/styles.css";

console.log(import.meta.env);

const endpoint =
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  import.meta.env.VITE_SOLANA_RPC_URL || getPublicSolanaRpcUrl("mainnet-beta");

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({
  urlOrMoniker: endpoint,
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

export const App: React.FC = () => {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="grill-theme">
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletAdapterProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <WalletAdapterCompatProvider>
                <SolanaProvider client={solanaClient}>
                  <GrillProvider
                    getExplorerLink={getSolscanExplorerLink}
                    staticTokenInfo={STATIC_TOKEN_INFO}
                  >
                    <div className="min-h-screen bg-background">
                      <RouterProvider router={router} />
                      <Toaster richColors position="bottom-right" />
                      <ReactQueryDevtools initialIsOpen={false} />
                    </div>
                  </GrillProvider>
                </SolanaProvider>
              </WalletAdapterCompatProvider>
            </WalletModalProvider>
          </WalletAdapterProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
