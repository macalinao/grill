# @macalinao/quarry

A library for interacting with the Quarry Protocol, redesigned and refactored for `@solana/kit`.

The old [Quarry SDK](https://github.com/QuarryProtocol/quarry) has several issues:

- It uses `@solana/web3.js` instead of the modern `@solana/kit`
- It has classes that are difficult to use and cause issues with bundlers that mix ESM and CJS
- It does not use modern JavaScript features such as `bigint`, leading to bloated bundles
- It is built on top of the `@coral-xyz/anchor` SDK, which loads in the entire IDL, also leading to bloated bundles. This package is built on top of the Coda-generated [Quarry client](https://github.com/macalinao/coda/tree/master/clients/quarry), which can benefit from tree-shaking.

This library is a rewrite which aims to be significantly more performant.

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
