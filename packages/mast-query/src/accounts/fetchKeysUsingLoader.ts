import type { Address } from "@solana/kit";
import { DataLoader } from "@macalinao/dataloader-es";
import { chunk, uniq } from "lodash-es";

export const fetchKeysUsingLoader = async <K extends Address, V>(
  keys: readonly K[],
  loader: DataLoader<K, V>,
  { chunkSize = 100 }: { chunkSize?: number } = {},
): Promise<Map<K, V>> => {
  const uniqueKeys = uniq(keys);
  const batches = chunk(uniqueKeys, chunkSize);
  
  const results = await Promise.all(
    batches.map((batch) => loader.loadMany(batch)),
  );

  const flattened = results.flat();
  const entries = uniqueKeys.map((key, index) => {
    const result = flattened[index];
    if (result instanceof Error) {
      throw result;
    }
    return [key, result] as const;
  });

  return new Map(entries.filter(([_, value]) => value !== undefined) as [K, V][]);
};