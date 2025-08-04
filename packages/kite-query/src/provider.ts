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

import type { KiteError } from "./errors";
import type { UseAccounts, UseAccountsArgs } from "./accounts/useAccountsInternal";
import { useAccountsInternal } from "./accounts/useAccountsInternal";
import type { UseHandleTXs, UseHandleTXsArgs } from "./tx/useHandleTXs";
import { useHandleTXsInternal } from "./tx/useHandleTXs";

export interface UseKite extends UseAccounts, UseHandleTXs {}

export type UseKiteArgs = Omit<
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
  onKiteError?: (err: KiteError) => void;
};

const defaultOnError = (err: KiteError) => console.error(err.message, err);

const useKiteInternal = ({
  onKiteError = defaultOnError,
  ...args
}: UseKiteArgs): UseKite => {
  const accounts = useAccountsInternal({ ...args, onError: onKiteError });
  const handleTXs = useHandleTXsInternal({
    ...args,
    onError: onKiteError,
    refetchMany: accounts.refetchMany,
  });

  return {
    ...accounts,
    ...handleTXs,
  };
};

export const { Provider: KiteProvider, useContainer: useKite } =
  createContainer(useKiteInternal);