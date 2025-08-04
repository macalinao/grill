import type { Address } from "@solana/kit";
import { useMemo } from "react";

import type { AccountParser, ParsedAccount } from "../types";
import { KiteAccountParseError } from "../errors";
import { useAccountData } from "../hooks/useAccountData";

export const useParsedAccount = <T = unknown>(
  accountId: Address | null | undefined,
  parser: AccountParser<T>,
): {
  data: ParsedAccount<T> | null | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const { data: accountData, loading, error, refetch } = useAccountData(accountId);

  const data = useMemo(() => {
    if (!accountId || !accountData || !accountData.data) {
      return null;
    }

    try {
      const parsed = parser(accountData.data);
      if (parsed === null || parsed === undefined) {
        return null;
      }

      return {
        accountId,
        accountInfo: {
          executable: accountData.executable,
          owner: accountData.owner,
          lamports: accountData.lamports,
          data: parsed,
        },
      } as ParsedAccount<T>;
    } catch (e) {
      throw new KiteAccountParseError(accountId, e);
    }
  }, [accountId, accountData, parser]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};