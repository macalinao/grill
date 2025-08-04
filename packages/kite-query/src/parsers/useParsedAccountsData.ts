import type { Address } from "@solana/kit";
import { useMemo } from "react";

import type { AccountParser, ParsedAccount } from "../types";
import { KiteAccountParseError } from "../errors";
import { useAccountsData } from "../hooks/useAccountsData";

export const useParsedAccountsData = <T = unknown>(
  accountIds: (Address | null | undefined)[],
  parser: AccountParser<T>,
): {
  data: Map<Address, ParsedAccount<T> | null>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const { data: accountsData, loading, error, refetch } = useAccountsData(accountIds);

  const data = useMemo(() => {
    const parsed = new Map<Address, ParsedAccount<T> | null>();
    
    accountsData.forEach((accountData, accountId) => {
      if (!accountData || !accountData.data) {
        parsed.set(accountId, null);
        return;
      }

      try {
        const parsedData = parser(accountData.data);
        if (parsedData === null || parsedData === undefined) {
          parsed.set(accountId, null);
          return;
        }

        parsed.set(accountId, {
          accountId,
          accountInfo: {
            executable: accountData.executable,
            owner: accountData.owner,
            lamports: accountData.lamports,
            data: parsedData,
          },
        });
      } catch (e) {
        throw new KiteAccountParseError(accountId, e);
      }
    });

    return parsed;
  }, [accountsData, parser]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};