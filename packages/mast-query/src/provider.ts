import type {
  GetAccountInfoApi,
  GetLatestBlockhashApi,
  GetMultipleAccountsApi,
  GetSignatureStatusesApi,
  GetTransactionApi,
  Rpc,
  SendTransactionApi,
} from "@solana/kit";
import { createContainer } from "unstated-next";

import type { MastError } from "./errors/index.js";
import type { UseAccounts, UseAccountsArgs } from "./accounts/useAccountsInternal.js";
import { useAccountsInternal } from "./accounts/useAccountsInternal.js";
import type { UseHandleTXs, UseHandleTXsArgs } from "./tx/useHandleTXs.js";
import { useHandleTXsInternal } from "./tx/useHandleTXs.js";

export interface UseMast extends UseAccounts, UseHandleTXs {}

export type UseMastArgs = Omit<
  UseAccountsArgs & Omit<UseHandleTXsArgs, "refetchMany">,
  "onError" | "rpc"
> & {
  rpc: Rpc<
    GetAccountInfoApi &
    GetMultipleAccountsApi &
    GetLatestBlockhashApi &
    SendTransactionApi &
    GetSignatureStatusesApi &
    GetTransactionApi
  >;
  onMastError?: (err: MastError) => void;
};

const defaultOnError = (err: MastError) => console.error(err.message, err);

const useMastInternal = (
  args?: UseMastArgs
): UseMast => {
  if (!args) {
    throw new Error("MastProvider requires configuration");
  }
  
  const { onMastError = defaultOnError, ...restArgs } = args;
  const accounts = useAccountsInternal({ ...restArgs, onError: onMastError });
  const handleTXs = useHandleTXsInternal({
    ...restArgs,
    onError: onMastError,
    refetchMany: accounts.refetchMany as any,
  });

  return {
    ...accounts,
    ...handleTXs,
  };
};

const container = createContainer(useMastInternal);

export const MastProvider = container.Provider as any;
export const useMast = container.useContainer as (() => UseMast);