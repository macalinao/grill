---
"@macalinao/gill-extra": minor
"@macalinao/zod-solana": minor
"@macalinao/grill": minor
---

Make token metadata validation pluggable so zod is no longer pulled into every bundle.

- `fetchTokenInfo` and `fetchTokenInfoForMint` accept a new `validateMetadata` option, and `GrillProvider`/`GrillHeadlessProvider` accept a matching `validateTokenMetadata` prop.
- The default is `defaultTokenMetadataValidator` (exported from `@macalinao/gill-extra`), a dependency-free shallow check that requires `name` and `symbol` to be strings and passes through the well-known optional string fields.
- To keep full Metaplex schema validation, pass `zodTokenMetadataValidator` from `@macalinao/zod-solana`:

  ```tsx
  import { zodTokenMetadataValidator } from "@macalinao/zod-solana";

  <GrillProvider validateTokenMetadata={zodTokenMetadataValidator}>
  ```

Importing `useTokenInfo` no longer drags zod into the bundle: it drops from ~70 KB to ~13 KB minified for apps that do not otherwise use zod.

Note the behaviour change in the default path: nested fields (`attributes`, `properties`, `collection`) and `seller_fee_basis_points` are no longer validated and are omitted from the parsed result. Supply `zodTokenMetadataValidator` if you depend on them.
