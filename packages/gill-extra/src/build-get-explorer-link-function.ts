export interface GetExplorerLinkArgs {
  transaction?: string;
  address?: string;
  block?: string | number;
  cluster?: "mainnet-beta" | "mainnet" | "devnet" | "testnet";
}

export type GetExplorerLinkFunction = (args?: GetExplorerLinkArgs) => string;

export interface ExplorerConfig {
  baseUrl: string;
  paths?: {
    transaction?: string;
    address?: string;
    block?: string;
  };
  clusterParam?: {
    name: string;
    values?: {
      devnet?: string;
      testnet?: string;
      "mainnet-beta"?: string;
      mainnet?: string;
    };
  };
}

/**
 * Builds a function that generates explorer links for a given blockchain explorer.
 * Uses URL and URLSearchParams to construct proper URLs.
 *
 * @param config - Configuration for the explorer
 * @returns A function that generates explorer links
 *
 * @example
 * const getSolscanLink = buildGetExplorerLinkFunction({
 *   baseUrl: "https://solscan.io",
 *   paths: {
 *     transaction: "tx",
 *     address: "account",
 *     block: "block"
 *   },
 *   clusterParam: {
 *     name: "cluster",
 *     values: {
 *       devnet: "devnet",
 *       testnet: "testnet"
 *     }
 *   }
 * });
 */
export function buildGetExplorerLinkFunction(
  config: ExplorerConfig,
): GetExplorerLinkFunction {
  const paths = {
    transaction: "tx",
    address: "address",
    block: "block",
    ...config.paths,
  };

  return (args = {}) => {
    const url = new URL(config.baseUrl);

    // Determine the resource path
    if ("transaction" in args && args.transaction) {
      url.pathname = `/${paths.transaction}/${args.transaction}`;
    } else if ("address" in args && args.address) {
      url.pathname = `/${paths.address}/${args.address}`;
    } else if ("block" in args && args.block !== undefined) {
      url.pathname = `/${paths.block}/${String(args.block)}`;
    }

    // Add cluster parameter if configured and needed
    if (config.clusterParam && args.cluster) {
      const clusterValues = config.clusterParam.values ?? {};
      const clusterValue = clusterValues[args.cluster];

      // Only add the parameter if there's a value for this cluster
      // This allows mainnet to have no parameter while others do
      if (clusterValue !== undefined) {
        url.searchParams.set(config.clusterParam.name, clusterValue);
      }
    }

    return url.toString();
  };
}
