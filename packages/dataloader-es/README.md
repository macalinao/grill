# @macalinao/dataloader-es

A modern ESM-native TypeScript implementation of Facebook's [DataLoader](https://github.com/graphql/dataloader) pattern for efficient batching and caching of data loading operations.

## Description

DataLoader is a utility for batching and caching data-fetching operations. It's particularly useful for GraphQL implementations and any application that needs to avoid the N+1 query problem by batching database or API requests.

This implementation is a TypeScript-first, ESM-native port that removes runtime type checking in favor of TypeScript's compile-time guarantees, making it lighter and more performant.

This is fully compatible with [the original DataLoader test suite](https://github.com/graphql/dataloader/blob/main/src/__tests__/dataloader.test.js) (ported from Flow to TypeScript, and made more typesafe).

## Installation

```bash
npm install @macalinao/dataloader-es
# or
yarn add @macalinao/dataloader-es
# or
bun add @macalinao/dataloader-es
```

## Usage

```typescript
import { DataLoader } from "@macalinao/dataloader-es";

// Create a DataLoader instance
const userLoader = new DataLoader<string, User>(async (userIds) => {
  // Batch function receives an array of keys
  const users = await fetchUsersByIds(userIds);

  // Must return an array of the same length as keys
  // with corresponding values or Error objects
  return userIds.map(
    (id) => users.find((u) => u.id === id) || new Error(`User ${id} not found`)
  );
});

// Load individual items (automatically batched)
const user1 = await userLoader.load("user-1");
const user2 = await userLoader.load("user-2");

// Load multiple items
const users = await userLoader.loadMany(["user-1", "user-2", "user-3"]);
```

## Features

- **Batching**: Automatically batches requests made within the same tick
- **Caching**: Built-in memoization with customizable cache implementation
- **TypeScript**: Full TypeScript support with strict typing
- **ESM Native**: Built for modern JavaScript environments
- **Lightweight**: No runtime type checking, leverages TypeScript instead

## API

### `new DataLoader(batchLoadFn, options?)`

Creates a new DataLoader instance.

- `batchLoadFn`: A function that accepts an array of keys and returns a Promise that resolves to an array of values or Errors
- `options`: Optional configuration object
  - `batch`: Enable/disable batching (default: `true`)
  - `maxBatchSize`: Maximum number of items per batch (default: `Infinity`)
  - `cache`: Enable/disable caching (default: `true`)
  - `cacheKeyFn`: Function to produce custom cache keys
  - `cacheMap`: Custom cache implementation (must implement Map-like interface)
  - `batchScheduleFn`: Custom batch scheduling function
  - `name`: Name for the DataLoader instance (useful for debugging)

### Methods

- `load(key)`: Load a single value
- `loadMany(keys)`: Load multiple values
- `clear(key)`: Clear a single cached value
- `clearAll()`: Clear all cached values
- `prime(key, value)`: Prime the cache with a specific key/value pair

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Credits

This is a TypeScript port of Facebook's [DataLoader](https://github.com/graphql/dataloader). The original implementation and API design are credited to the GraphQL Foundation and Facebook.
