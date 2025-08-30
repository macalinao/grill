import type { GetExplorerLinkFunction } from "./build-get-explorer-link-function.js";
import { buildGetExplorerLinkFunction } from "./build-get-explorer-link-function.js";

/**
 * Creates a Solscan explorer link for viewing transactions, addresses, or blocks.
 *
 * @param args - The arguments for generating the explorer link
 * @returns A Solscan URL string for the specified resource
 *
 * @example
 * // For a transaction
 * getSolscanExplorerLink({ transaction: signature })
 *
 * @example
 * // For an address
 * getSolscanExplorerLink({ address: publicKey })
 *
 * @example
 * // For a specific cluster
 * getSolscanExplorerLink({ transaction: signature, cluster: "devnet" })
 */
export const getSolscanExplorerLink: GetExplorerLinkFunction =
  buildGetExplorerLinkFunction({
    baseUrl: "https://solscan.io",
    paths: {
      transaction: "tx",
      address: "account",
      block: "block",
    },
    clusterParam: {
      name: "cluster",
      values: {
        devnet: "devnet",
        testnet: "testnet",
        // mainnet-beta and mainnet don't need a parameter
      },
    },
  });
