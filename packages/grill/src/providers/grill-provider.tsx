import type { FC } from "react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import type { TransactionStatusEvent } from "../types.js";
import type { GrillHeadlessProviderProps } from "./grill-headless-provider.js";
import { GrillHeadlessProvider } from "./grill-headless-provider.js";

/**
 * Props for the GrillProvider component
 */
export interface GrillProviderProps
  extends Omit<GrillHeadlessProviderProps, "onTransactionStatusEvent"> {
  /**
   * Optional custom handler for transaction status events.
   * If not provided, will use default toast notifications.
   */
  onTransactionStatusEvent?: (event: TransactionStatusEvent) => void;
  /**
   * Whether to show toast notifications for transaction status events.
   * @default true
   */
  showToasts?: boolean;
  /**
   * Duration in milliseconds for success toasts.
   * @default 5000
   */
  successToastDuration?: number;
  /**
   * Duration in milliseconds for error toasts.
   * @default 7000
   */
  errorToastDuration?: number;
}

/**
 * Provider component for Solana account batching functionality with transaction toast notifications.
 * Wraps GrillHeadlessProvider and adds automatic toast notifications via sonner.
 */
export const GrillProvider: FC<GrillProviderProps> = ({
  children,
  onTransactionStatusEvent,
  showToasts = true,
  successToastDuration = 5000,
  errorToastDuration = 7000,
  ...props
}) => {
  // Store toast IDs for each transaction
  const toastIds = useRef<Map<string, string | number>>(new Map());

  const handleTransactionStatus = useCallback(
    (event: TransactionStatusEvent) => {
      // Call custom handler if provided
      onTransactionStatusEvent?.(event);

      // Skip toast notifications if disabled
      if (!showToasts) {
        return;
      }

      const txId = event.id;
      const existingToastId = toastIds.current.get(txId);

      // Helper to create explorer link action
      const createExplorerAction = (link: string) => ({
        label: "View",
        onClick: () => window.open(link, "_blank"),
      });

      switch (event.type) {
        case "error-wallet-not-connected": {
          // Clean up any existing toast
          if (existingToastId) {
            toast.dismiss(existingToastId);
            toastIds.current.delete(txId);
          }
          toast.error("Wallet not connected", {
            description: "Please connect your wallet to continue",
            duration: errorToastDuration,
          });
          break;
        }

        case "preparing": {
          // Clean up any existing toast for this transaction
          if (existingToastId) {
            toast.dismiss(existingToastId);
            toastIds.current.delete(txId);
          }
          const toastId = toast.loading(event.title, {
            description: "Building transaction",
          });
          toastIds.current.set(txId, toastId);
          break;
        }

        case "awaiting-wallet-signature": {
          // Update existing toast or create new one
          const description = "Please approve in your wallet";

          if (existingToastId) {
            toast.loading(event.title, {
              id: existingToastId,
              description,
            });
          } else {
            const toastId = toast.loading(event.title, {
              description,
            });
            toastIds.current.set(txId, toastId);
          }
          break;
        }

        case "waiting-for-confirmation": {
          // Update existing toast or create new one
          const description = `Transaction: ${event.sig.slice(0, 8)}...${event.sig.slice(-8)}`;
          const action = createExplorerAction(event.explorerLink);

          if (existingToastId) {
            toast.loading(event.title, {
              id: existingToastId,
              description,
              action,
            });
          } else {
            const toastId = toast.loading(event.title, {
              description,
              action,
            });
            toastIds.current.set(txId, toastId);
          }
          break;
        }

        case "confirmed": {
          const description = `Transaction: ${event.sig.slice(0, 8)}...${event.sig.slice(-8)}`;
          const action = createExplorerAction(event.explorerLink);

          console.log({ event, existingToastId, description, action });

          if (existingToastId) {
            // Update existing toast to success
            toast.success(event.title, {
              id: existingToastId,
              description,
              duration: successToastDuration,
              action,
            });
          } else {
            // Create new success toast if somehow we don't have one
            toast.success(event.title, {
              description,
              duration: successToastDuration,
              action,
            });
          }
          // Clean up toast ID after success
          toastIds.current.delete(txId);
          break;
        }

        case "error-transaction-failed": {
          const description = event.errorMessage;
          const action = createExplorerAction(event.explorerLink);

          if (existingToastId) {
            // Update existing toast to error
            toast.error(event.title, {
              id: existingToastId,
              description,
              duration: errorToastDuration,
              action,
            });
          } else {
            // Create new error toast if somehow we don't have one
            toast.error(event.title, {
              description,
              duration: errorToastDuration,
              action,
            });
          }
          // Clean up toast ID after error
          toastIds.current.delete(txId);
          break;
        }
      }
    },
    [
      onTransactionStatusEvent,
      showToasts,
      successToastDuration,
      errorToastDuration,
    ],
  );

  return (
    <GrillHeadlessProvider
      onTransactionStatusEvent={handleTransactionStatus}
      {...props}
    >
      {children}
    </GrillHeadlessProvider>
  );
};
