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
import { SolanaProvider } from "gill-react";
import { useMemo } from "react";
import { Toaster } from "sonner";

import { SimpleDashboard } from "./components/SimpleDashboard";
import { ThemeProvider } from "./components/theme-provider";

import "@solana/wallet-adapter-react-ui/styles.css";
import { createSolanaClient } from "gill";

const queryClient = new QueryClient();
const solanaClient = createSolanaClient({ urlOrMoniker: "mainnet-beta" });

function App() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="grill-theme">
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletAdapterProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <WalletAdapterCompatProvider>
                <SolanaProvider client={solanaClient}>
                  <GrillProvider>
                    <div className="min-h-screen bg-background">
                      <SimpleDashboard />
                      <Toaster position="bottom-right" />
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
