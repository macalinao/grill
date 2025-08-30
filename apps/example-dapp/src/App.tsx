import type * as React from "react";
import { GrillProvider, getSolscanExplorerLink } from "@macalinao/grill";
import { WalletAdapterCompatProvider } from "@macalinao/wallet-adapter-compat";
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
import { SolanaProvider } from "gill-react";
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

const endpoint =
  import.meta.env.VITE_SOLANA_RPC_URL ?? getPublicSolanaRpcUrl("mainnet-beta");

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({
  urlOrMoniker: endpoint,
});

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
                  <GrillProvider getExplorerLink={getSolscanExplorerLink}>
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
