// A Function, which when given an Array of keys, returns a Promise of an Array
// of values or Errors.
export type BatchLoadFn<K, V> = (
  keys: readonly K[],
) => Promise<readonly (V | Error)[]>;

// Optionally turn off batching or caching or provide a cache key function or a
// custom cache instance.
export interface Options<K, V, C = K> {
  /**
   * Default `true`. Set to `false` to disable batching, invoking
   * `batchLoadFn` with a single load key. This is equivalent to setting
   * `maxBatchSize` to `1`.
   */
  batch?: boolean;

  /**
   * Default `Infinity`. Limits the number of items that get passed in to the
   * `batchLoadFn`. May be set to `1` to disable batching.
   */
  maxBatchSize?: number;

  /**
   * Default see https://github.com/graphql/dataloader#batch-scheduling.
   * A function to schedule the later execution of a batch. The function is
   * expected to call the provided callback in the immediate future.
   */
  batchScheduleFn?: (callback: () => void) => void;

  /**
   * Default `true`. Set to `false` to disable memoization caching, creating a
   * new Promise and new key in the `batchLoadFn` for every load of the same
   * key. This is equivalent to setting `cacheMap` to `null`.
   */
  cache?: boolean;

  /**
   * Default `key => key`. Produces cache key for a given load key. Useful
   * when keys are objects and two objects should be considered equivalent.
   */
  cacheKeyFn?: (key: K) => C;

  /**
   * Default `new Map()`. Instance of `Map` (or an object with a similar API)
   * to be used as cache. May be set to `null` to disable caching.
   */
  cacheMap?: CacheMap<C, Promise<V>> | null;

  /**
   * The name given to this `DataLoader` instance. Useful for APM tools.
   *
   * Is `null` if not set in the constructor.
   */
  name?: string | null;
}

// If a custom cache is provided, it must be of this type (a subset of ES6 Map).
export interface CacheMap<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  delete(key: K): void;
  clear(): void;
}

// Private: Describes a batch of requests
export interface Batch<K, V> {
  hasDispatched: boolean;
  keys: K[];
  callbacks: {
    resolve: (value: V) => void;
    reject: (error: Error) => void;
  }[];
  cacheHits?: (() => void)[];
}
