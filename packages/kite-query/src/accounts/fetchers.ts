import type { Address } from "@solana/kit";
import { address, getBase64Decoder } from "@solana/kit";
import { uniq, zip } from "lodash-es";

import { KiteAccountLoadError, KiteBatchFetchError } from "../errors";
import type { AccountInfo, KiteBatchProvider } from "./batchProvider";

export interface AccountFetchResult {
  data: Uint8Array | null;
  executable: boolean;
  lamports: bigint;
  owner: Address;
}

export async function fetchAccountsUsingProvider(
  provider: KiteBatchProvider,
  keys: Address[],
): Promise<Map<Address, AccountFetchResult | null>> {
  if (keys.length === 0) {
    return new Map();
  }

  const uniqueKeys = uniq(keys);
  const decoder = getBase64Decoder();

  try {
    const results = await provider.loadMany(uniqueKeys);
    
    const entries = zip(uniqueKeys, results)
      .filter((pair): pair is [Address, AccountInfo | null] => pair[0] !== undefined)
      .map(([key, account]) => {
        if (!account) {
          return [key, null] as const;
        }

        const data = decoder.decode(account.data) as Uint8Array;
        return [
          key,
          {
            data,
            executable: account.executable,
            lamports: account.lamports,
            owner: account.owner,
          },
        ] as const;
      });

    return new Map(entries);
  } catch (error) {
    throw new KiteBatchFetchError(error);
  }
}

export async function fetchAccountUsingProvider(
  provider: KiteBatchProvider,
  key: Address,
): Promise<AccountFetchResult | null> {
  try {
    const account = await provider.load(key);
    
    if (!account) {
      return null;
    }

    const decoder = getBase64Decoder();
    const data = decoder.decode(account.data) as Uint8Array;
    
    return {
      data,
      executable: account.executable,
      lamports: account.lamports,
      owner: account.owner,
    };
  } catch (error) {
    throw new KiteAccountLoadError(key, error);
  }
}