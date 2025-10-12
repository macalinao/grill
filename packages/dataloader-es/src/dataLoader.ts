/** biome-ignore-all lint/style/noNonNullAssertion: copied from graphql/dataloader so it's ok */
import type { Batch, BatchLoadFn, CacheMap, Options } from "./types.js";

/**
 * A `DataLoader` creates a public API for loading data from a particular
 * data back-end with unique keys such as the `id` column of a SQL table or
 * document name in a MongoDB database, given a batch loading function.
 *
 * Each `DataLoader` instance contains a unique memoized cache. Use caution when
 * used in long-lived applications or those which serve many users with
 * different access permissions and consider creating a new instance per
 * web request.
 */
export class DataLoader<K, V, C = K> {
  // Private
  #batchLoadFn: BatchLoadFn<K, V>;
  #maxBatchSize: number;
  #batchScheduleFn: (callback: () => void) => void;
  #cacheKeyFn: (key: K) => C;
  #cacheMap: CacheMap<C, Promise<V>> | null;
  #batch: Batch<K, V> | null;

  /**
   * The name given to this `DataLoader` instance. Useful for APM tools.
   *
   * Is `null` if not set in the constructor.
   */
  name: string | null;

  constructor(batchLoadFn: BatchLoadFn<K, V>, options?: Options<K, V, C>) {
    this.#batchLoadFn = batchLoadFn;
    this.#maxBatchSize = getValidMaxBatchSize(options);
    this.#batchScheduleFn = getValidBatchScheduleFn(options);
    this.#cacheKeyFn = getValidCacheKeyFn(options);
    this.#cacheMap = getValidCacheMap(options);
    this.#batch = null;
    this.name = getValidName(options);
  }

  /**
   * Loads a key, returning a `Promise` for the value represented by that key.
   */
  load(key: K): Promise<V> {
    const batch = this.#getCurrentBatch();
    const cacheMap = this.#cacheMap;
    let cacheKey: C | undefined;

    // If caching and there is a cache-hit, return cached Promise.
    if (cacheMap) {
      cacheKey = this.#cacheKeyFn(key);
      const cachedPromise = cacheMap.get(cacheKey);
      if (cachedPromise) {
        batch.cacheHits ??= [];
        const cacheHits = batch.cacheHits;
        return new Promise<V>((resolve) => {
          cacheHits.push(() => {
            resolve(cachedPromise);
          });
        });
      }
    }

    // Otherwise, produce a new Promise for this key, and enqueue it to be
    // dispatched along with the current batch.
    batch.keys.push(key);
    const promise = new Promise<V>((resolve, reject) => {
      batch.callbacks.push({ resolve, reject });
    });

    // If caching, cache this promise.
    if (cacheMap && cacheKey !== undefined) {
      cacheMap.set(cacheKey, promise);
    }

    return promise;
  }

  /**
   * Loads multiple keys, promising an array of values:
   *
   *     var [ a, b ] = await myLoader.loadMany([ 'a', 'b' ]);
   *
   * This is similar to the more verbose:
   *
   *     var [ a, b ] = await Promise.all([
   *       myLoader.load('a'),
   *       myLoader.load('b')
   *     ]);
   *
   * However it is different in the case where any load fails. Where
   * Promise.all() would reject, loadMany() always resolves, however each result
   * is either a value or an Error instance.
   *
   *     var [ a, b, c ] = await myLoader.loadMany([ 'a', 'b', 'badkey' ]);
   *     // c instanceof Error
   *
   */
  loadMany(keys: readonly K[]): Promise<(V | Error)[]> {
    return Promise.all(
      keys.map((key) =>
        this.load(key).catch((error: unknown) => error as Error),
      ),
    );
  }

  /**
   * Clears the value at `key` from the cache, if it exists. Returns itself for
   * method chaining.
   */
  clear(key: K): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);
      cacheMap.delete(cacheKey);
    }
    return this;
  }

  /**
   * Clears the entire cache. To be used when some event results in unknown
   * invalidations across this particular `DataLoader`. Returns itself for
   * method chaining.
   */
  clearAll(): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      cacheMap.clear();
    }
    return this;
  }

  /**
   * Adds the provided key and value to the cache. If the key already
   * exists, no change is made. Returns itself for method chaining.
   *
   * To prime the cache with an error at a key, provide an Error instance.
   */
  prime(key: K, value: V | Promise<V> | Error): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);

      // Only add the key if it does not already exist.
      if (cacheMap.get(cacheKey) === undefined) {
        // Cache a rejected promise if the value is an Error, in order to match
        // the behavior of load(key).
        let promise: Promise<V>;
        if (value instanceof Error) {
          promise = Promise.reject(value);
          // Since this is a case where an Error is intentionally being primed
          // for a given key, we want to disable unhandled promise rejection.
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          promise.catch(() => {});
        } else {
          promise = Promise.resolve(value);
        }
        cacheMap.set(cacheKey, promise);
      }
    }
    return this;
  }

  // Private: Either returns the current batch, or creates and schedules a
  // dispatch of a new batch for the given loader.
  #getCurrentBatch(): Batch<K, V> {
    // If there is an existing batch which has not yet dispatched and is within
    // the limit of the batch size, then return it.
    const existingBatch = this.#batch;
    if (
      existingBatch !== null &&
      !existingBatch.hasDispatched &&
      existingBatch.keys.length < this.#maxBatchSize
    ) {
      return existingBatch;
    }

    // Otherwise, create a new batch for this loader.
    const newBatch: Batch<K, V> = {
      hasDispatched: false,
      keys: [],
      callbacks: [],
    };

    // Store it on the loader so it may be reused.
    this.#batch = newBatch;

    // Then schedule a task to dispatch this batch of requests.
    this.#batchScheduleFn(() => {
      this.#dispatchBatch(newBatch);
    });

    return newBatch;
  }

  #dispatchBatch(batch: Batch<K, V>) {
    // Mark this batch as having been dispatched.
    batch.hasDispatched = true;

    // If there's nothing to load, resolve any cache hits and return early.
    if (batch.keys.length === 0) {
      resolveCacheHits(batch);
      return;
    }

    // Call the provided batchLoadFn for this loader with the batch's keys and
    // with the loader as the `this` context.
    const batchPromise = this.#batchLoadFn(batch.keys);

    // Await the resolution of the call to batchLoadFn.
    batchPromise
      .then((values) => {
        // Resolve all cache hits in the same micro-task as freshly loaded values.
        resolveCacheHits(batch);

        // Step through values, resolving or rejecting each Promise in the batch.
        for (let i = 0; i < batch.callbacks.length; i++) {
          const value = values[i] as V;
          if (value instanceof Error) {
            batch.callbacks[i]?.reject(value);
          } else {
            batch.callbacks[i]?.resolve(value);
          }
        }
      })
      .catch((error: unknown) => {
        this.#failedDispatch(batch, error as Error);
      });
  }

  // Private: do not cache individual loads if the entire batch dispatch fails,
  // but still reject each request so they do not hang.
  #failedDispatch(batch: Batch<K, V>, error: Error) {
    // Cache hits are resolved, even though the batch failed.
    resolveCacheHits(batch);
    for (let i = 0; i < batch.keys.length; i++) {
      this.clear(batch.keys[i]!);

      batch.callbacks[i]?.reject(error);
    }
  }
}

// Private: Resolves the Promises for any cache hits in this batch.
function resolveCacheHits<K, V>(batch: Batch<K, V>) {
  if (batch.cacheHits) {
    for (const cacheHit of batch.cacheHits) {
      cacheHit();
    }
  }
}

// Private: given the DataLoader's options, produce a valid max batch size.
function getValidMaxBatchSize<K, V, C>(options?: Options<K, V, C>): number {
  const shouldBatch = !options || options.batch !== false;
  if (!shouldBatch) {
    return 1;
  }
  const maxBatchSize = options?.maxBatchSize;
  if (maxBatchSize === undefined) {
    return Number.POSITIVE_INFINITY;
  }
  return maxBatchSize;
}

// Private
function getValidBatchScheduleFn<K, V, C>(
  options?: Options<K, V, C>,
): (callback: () => void) => void {
  const batchScheduleFn = options?.batchScheduleFn;
  if (batchScheduleFn === undefined) {
    // Unlike the original DataLoader, we assume `setTimeout` is available.
    return (cb) => setTimeout(cb, 0);
  }
  return batchScheduleFn;
}

// Private: given the DataLoader's options, produce a cache key function.
function getValidCacheKeyFn<K, C>(
  options?: Options<K, unknown, C>,
): (key: K) => C {
  const cacheKeyFn = options?.cacheKeyFn;
  if (cacheKeyFn === undefined) {
    return (key) => key as unknown as C;
  }
  return cacheKeyFn;
}

// Private: given the DataLoader's options, produce a CacheMap to be used.
function getValidCacheMap<K, V, C>(
  options?: Options<K, V, C>,
): CacheMap<C, Promise<V>> | null {
  const shouldCache = !options || options.cache !== false;
  if (!shouldCache) {
    return null;
  }
  const cacheMap = options?.cacheMap;
  if (cacheMap === undefined) {
    return new Map();
  }
  return cacheMap;
}

function getValidName<K, V, C>(options?: Options<K, V, C>): string | null {
  if (options?.name) {
    return options.name;
  }

  return null;
}
