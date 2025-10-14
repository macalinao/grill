# @macalinao/grill

## 0.7.0

### Minor Changes

- ef7c68e: Change compute unit stuff to be not included by default

### Patch Changes

- 5ebaaa1: Add parseTransactionError, new error type
- Updated dependencies [5ebaaa1]
- Updated dependencies [ef7c68e]
  - @macalinao/gill-extra@0.2.0

## 0.6.5

### Patch Changes

- ffac787: Bump to Bun 1.3
- Updated dependencies [ceff137]
  - @macalinao/token-utils@0.1.10

## 0.6.4

### Patch Changes

- f17031d: Fix bun-types import
- d3ee6e1: Bump dependencies
- Updated dependencies [f17031d]
- Updated dependencies [d3ee6e1]
  - @macalinao/solana-batch-accounts-loader@0.2.7
  - @macalinao/dataloader-es@0.2.6
  - @macalinao/token-utils@0.1.9
  - @macalinao/gill-extra@0.1.3
  - @macalinao/zod-solana@0.1.9

## 0.6.3

### Patch Changes

- fecc82c: Bump dependencies
- Updated dependencies [fecc82c]
  - @macalinao/gill-extra@0.1.2
  - @macalinao/zod-solana@0.1.8

## 0.6.2

### Patch Changes

- 171abf8: Make PDA null if PDA hook is null
- Updated dependencies [9bd8013]
  - @macalinao/gill-extra@0.1.0

## 0.6.1

### Patch Changes

- 481456c: Change resolution to be ^ rather than \* for workspace packages
- Updated dependencies [481456c]
  - @macalinao/solana-batch-accounts-loader@0.2.6
  - @macalinao/gill-extra@0.0.8

## 0.6.0

### Minor Changes

- 7300702: Fix bugs around quarry merge miner initialization, more pda hooks

## 0.5.14

### Patch Changes

- 42846e7: Dependency bumps
- Updated dependencies [42846e7]
  - @macalinao/gill-extra@0.0.7
  - @macalinao/zod-solana@0.1.7

## 0.5.13

### Patch Changes

- b0a90a2: Add re-exports from Gill
- Updated dependencies [b0a90a2]
  - @macalinao/gill-extra@0.0.6

## 0.5.12

### Patch Changes

- b577d51: Add support for multiple pdas/token accounts being fetched
- Updated dependencies [b577d51]
  - @macalinao/gill-extra@0.0.5
  - @macalinao/zod-solana@0.1.6

## 0.5.11

### Patch Changes

- 48ec0ee: Add staticTokenInfo prop

## 0.5.10

### Patch Changes

- Updated dependencies [3d64ada]
  - @macalinao/zod-solana@0.1.5
  - @macalinao/gill-extra@0.0.4

## 0.5.9

### Patch Changes

- aef5258: Update all dependencies
- Updated dependencies [aef5258]
  - @macalinao/gill-extra@0.0.3

## 0.5.8

### Patch Changes

- Updated dependencies [893371f]
  - @macalinao/gill-extra@0.0.2

## 0.5.7

### Patch Changes

- bf01031: Query key cleanup
- d6e8cfb: Grill hook client key cleanup
- Updated dependencies [3681f7a]
- Updated dependencies [ec4287f]
  - @macalinao/gill-extra@0.0.1

## 0.5.6

### Patch Changes

- d0e677b: Update dependencies, speed up linting

## 0.5.5

### Patch Changes

- 85dece6: Alter Biome config
- Updated dependencies [85dece6]
  - @macalinao/solana-batch-accounts-loader@0.2.5
  - @macalinao/dataloader-es@0.2.5
  - @macalinao/token-utils@0.1.8
  - @macalinao/zod-solana@0.1.4

## 0.5.4

### Patch Changes

- 67558f1: Add addresses to useAccount

## 0.5.3

### Patch Changes

- 1a5e0bd: Update dependencies
- aabb7d1: Add balance helpers
- Updated dependencies [1a5e0bd]
- Updated dependencies [3411158]
  - @macalinao/zod-solana@0.1.3
  - @macalinao/token-utils@0.1.7

## 0.5.2

### Patch Changes

- Updated dependencies [a9d96c1]
- Updated dependencies [e8cb12d]
  - @macalinao/token-utils@0.1.6

## 0.5.1

### Patch Changes

- 57adf4b: README license updates
- 04169c9: Add AccountInfo helper type
- e882c7d: Add transaction message encoder helpers
- Updated dependencies [57adf4b]
  - @macalinao/solana-batch-accounts-loader@0.2.4
  - @macalinao/dataloader-es@0.2.4
  - @macalinao/token-utils@0.1.5
  - @macalinao/zod-solana@0.1.2

## 0.5.0

### Minor Changes

- 9bc5c90: Breaking: Simplify useAccounts return type

### Patch Changes

- b3c1751: Dependency bumps
- Updated dependencies [9bc5c90]
- Updated dependencies [b3c1751]
  - @macalinao/token-utils@0.1.4
  - @macalinao/zod-solana@0.1.1

## 0.4.3

### Patch Changes

- 28b6a62: Add useAccounts hook for fetching multiple accounts

## 0.4.2

### Patch Changes

- 6ca32bc: Fix src/ not being included in packages
- Updated dependencies [6ca32bc]
- Updated dependencies [6eb3aa0]
  - @macalinao/token-utils@0.1.3

## 0.4.1

### Patch Changes

- Updated dependencies [912b622]
- Updated dependencies [5c893a9]
  - @macalinao/zod-solana@0.1.0

## 0.4.0

### Minor Changes

- 35a7d46: Use @macalinao/clients-token-metadata instead

## 0.3.2

### Patch Changes

- 64b4a18: Fix src/ directory not being included in Grill
- 4e5efaa: Clean up dependencies and peer dependencies
- 2cd4a4b: Move @types/bun into catalog
- Updated dependencies [4e5efaa]
- Updated dependencies [2cd4a4b]
  - @macalinao/solana-batch-accounts-loader@0.2.3
  - @macalinao/token-metadata-client@0.1.2
  - @macalinao/dataloader-es@0.2.3
  - @macalinao/zod-solana@0.0.5
  - @macalinao/token-utils@0.1.2

## 0.3.1

### Patch Changes

- c7eb4a2: Add sideEffects: false to pacakges
- Updated dependencies [c7eb4a2]
  - @macalinao/solana-batch-accounts-loader@0.2.2
  - @macalinao/dataloader-es@0.2.2
  - @macalinao/token-utils@0.1.1
  - @macalinao/zod-solana@0.0.4

## 0.3.0

### Minor Changes

- 49c1d2c: Restructure sendTX types, add error toasts for transaction signing rejected

### Patch Changes

- 87c6415: Add support for token metadata fetching
- Updated dependencies [0d09839]
- Updated dependencies [5555546]
- Updated dependencies [87c6415]
  - @macalinao/token-metadata-client@0.1.1
  - @macalinao/zod-solana@0.0.3

## 0.2.3

### Patch Changes

- 26af4d0: Add address validator for Zod
- Updated dependencies [26af4d0]
  - @macalinao/zod-solana@0.0.2

## 0.2.2

### Patch Changes

- 0a3cfb6: Fix sonner peer dependency
- 78e247a: Support custom explorers (Solscan example)

## 0.2.1

### Patch Changes

- f450ea4: Re-release for fixed chagneset config
- Updated dependencies [f450ea4]
  - @macalinao/dataloader-es@0.2.1
  - @macalinao/solana-batch-accounts-loader@0.2.1

## 0.2.0

### Minor Changes

- 32cc1bb: Force republish
- c85a7ca: Refactor transaction sending

### Patch Changes

- Updated dependencies [32cc1bb]
  - @macalinao/dataloader-es@0.2.0
  - @macalinao/solana-batch-accounts-loader@0.2.0
