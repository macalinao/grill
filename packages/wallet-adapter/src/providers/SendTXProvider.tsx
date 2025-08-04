import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Toaster } from "sonner";

export interface SendTXContextValue {
  // Future extension point for transaction state management
}

const SendTXContext = createContext<SendTXContextValue | undefined>(undefined);

export interface SendTXProviderProps {
  children: ReactNode;
}

export function SendTXProvider({ children }: SendTXProviderProps) {
  const value: SendTXContextValue = {};

  return (
    <SendTXContext.Provider value={value}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#ffffff",
            border: "1px solid #333",
          },
        }}
      />
      {children}
    </SendTXContext.Provider>
  );
}

export function useSendTXContext(): SendTXContextValue {
  const context = useContext(SendTXContext);
  if (!context) {
    throw new Error("useSendTXContext must be used within SendTXProvider");
  }
  return context;
}