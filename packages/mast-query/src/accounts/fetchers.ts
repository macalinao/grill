import type { Address } from "@solana/kit";
import type { DataLoader } from "@macalinao/dataloader-es";
import type { AccountInfo } from "@macalinao/solana-batch-accounts-loader";
import { uniq, zip } from "lodash-es";

import { MastAccountLoadError, MastBatchFetchError } from "../errors/index.js";

export interface AccountFetchResult {
  data: Uint8Array | null;
  executable: boolean;
  lamports: bigint;
  owner: Address;
}

export async function fetchAccountsUsingLoader(
  loader: DataLoader<string, AccountInfo | null>,
  keys: Address[],
): Promise<Map<Address, AccountFetchResult | null>> {
  if (keys.length === 0) {
    return new Map();
  }

  const uniqueKeys = uniq(keys);

  try {
    const results = await loader.loadMany(uniqueKeys.map(String));
    
    const entries = zip(uniqueKeys, results)
      .filter((pair): pair is [Address, AccountInfo | null | Error] => pair[0] !== undefined)
      .map(([key, result]) => {
        if (result instanceof Error) {
          throw result;
        }
        
        if (!result) {
          return [key, null] as const;
        }

        return [
          key,
          {
            data: result.data as Uint8Array,
            executable: result.executable,
            lamports: result.lamports,
            owner: result.owner,
          },
        ] as const;
      });

    return new Map(entries);
  } catch (error) {
    throw new MastBatchFetchError(error);
  }
}

export async function fetchAccountUsingLoader(
  loader: DataLoader<string, AccountInfo | null>,
  key: Address,
): Promise<AccountFetchResult | null> {
  try {
    const account = await loader.load(String(key));
    
    if (!account) {
      return null;
    }
    
    return {
      data: account.data as Uint8Array,
      executable: account.executable,
      lamports: account.lamports,
      owner: account.owner,
    };
  } catch (error) {
    throw new MastAccountLoadError(key, error);
  }
}