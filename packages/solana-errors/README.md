# @macalinao/solana-errors

Solana error message formatting that works in production.

Unlike `@solana/errors`, which strips its message catalog when `__DEV__` is
false, this package includes the full messages by default — so you can show
users a real explanation rather than an error code.

## Usage

```ts
import {
  getInstructionErrorMessage,
  getTransactionErrorMessage,
} from "@macalinao/solana-errors";

getTransactionErrorMessage("BlockhashNotFound");
// "Blockhash not found in recent blockhashes or in the blockhash queue"

getInstructionErrorMessage({ Custom: 6000 });
// "Custom program error: 0x1770 (6000)"
```

## Stripping messages from your bundle

The message tables cost roughly 6 KB minified. If you would rather ship error
codes than prose, define `__GRILL_ERROR_MESSAGES__` as `false` and your bundler
will drop them as dead code:

```ts
// vite.config.ts
export default defineConfig({
  define: { __GRILL_ERROR_MESSAGES__: "false" },
});
```

```ts
// webpack
new webpack.DefinePlugin({ __GRILL_ERROR_MESSAGES__: false });
```

The functions then return the variant name instead of its description:

```ts
getTransactionErrorMessage("BlockhashNotFound");
// "Transaction error: BlockhashNotFound"
```

Two caveats:

- The tables are only dropped if you do not import `INSTRUCTION_ERROR_MESSAGES`
  or `TRANSACTION_ERROR_MESSAGES` directly.
- Your bundler has to re-run dead-code elimination after constant folding.
  Rollup, rolldown, and Vite do. Plain esbuild and `bun build` fold the branch
  but keep the now-unreferenced tables.

`ERROR_MESSAGES_ENABLED` exports the resolved value of the flag if you need to
branch on it yourself.

## License

Apache-2.0
