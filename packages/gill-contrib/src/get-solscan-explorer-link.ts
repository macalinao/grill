export interface GetExplorerLinkArgs {
  transaction?: string;
  address?: string;
  block?: string | number;
  cluster?: "mainnet-beta" | "mainnet" | "devnet" | "testnet";
}

export type GetExplorerLinkFunction = (args?: GetExplorerLinkArgs) => string;

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
export const getSolscanExplorerLink: GetExplorerLinkFunction = (args = {}) => {
  const baseUrl = "https://solscan.io";

  // Determine the cluster suffix
  let clusterSuffix = "";
  if (args.cluster) {
    if (args.cluster === "devnet") {
      clusterSuffix = "?cluster=devnet";
    } else if (args.cluster === "testnet") {
      clusterSuffix = "?cluster=testnet";
    }
    // mainnet-beta and mainnet don't need a suffix
  }

  // Generate the appropriate link based on the type
  if ("transaction" in args && args.transaction) {
    return `${baseUrl}/tx/${args.transaction}${clusterSuffix}`;
  }

  if ("address" in args && args.address) {
    return `${baseUrl}/account/${args.address}${clusterSuffix}`;
  }

  if ("block" in args && args.block !== undefined) {
    return `${baseUrl}/block/${String(args.block)}${clusterSuffix}`;
  }

  // Default to homepage if no specific resource is provided
  return baseUrl;
};
