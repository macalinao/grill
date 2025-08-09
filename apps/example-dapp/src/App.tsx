import { GrillProvider } from "@macalinao/grill";
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
import { SolanaProvider } from "gill-react";
import { useMemo } from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "./components/theme-provider";
import { routeTree } from "./routeTree.gen";

// Create the router instance
const router = createRouter({ routeTree });

// Register the router instance for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

import "@solana/wallet-adapter-react-ui/styles.css";
import { createSolanaClient } from "gill";

console.log(import.meta.env);
console.log(import.meta.env.VITE_SOLANA_RPC_URL ?? "mainnet-beta");

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({
  urlOrMoniker: import.meta.env.VITE_SOLANA_RPC_URL ?? "mainnet-beta",
});

function App() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="grill-theme">
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={"https://api.mainnet-beta.solana.com"}>
          <WalletAdapterProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <WalletAdapterCompatProvider>
                <SolanaProvider client={solanaClient}>
                  <GrillProvider>
                    <div className="min-h-screen bg-background">
                      <RouterProvider router={router} />
                      <Toaster position="bottom-right" />
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
}

export default App;
