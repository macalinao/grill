import type { Address } from "@solana/kit";
import { useMemo } from "react";

import type { AccountParser, ParsedAccount } from "../types.js";
import { MastAccountParseError } from "../errors/index.js";
import { useAccountsData } from "../hooks/useAccountsData.js";

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
        // Data is already Uint8Array
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
        throw new MastAccountParseError(accountId, e);
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