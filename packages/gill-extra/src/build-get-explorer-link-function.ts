/**
 * Arguments for generating an explorer link.
 */
export interface GetExplorerLinkArgs {
  /**
   * Transaction signature to link to.
   * Mutually exclusive with address and block.
   */
  transaction?: string;

  /**
   * Address (account public key) to link to.
   * Mutually exclusive with transaction and block.
   */
  address?: string;

  /**
   * Block number or slot to link to.
   * Mutually exclusive with transaction and address.
   */
  block?: string | number;

  /**
   * Solana cluster to use.
   * Defaults to mainnet if not specified.
   */
  cluster?: "mainnet-beta" | "mainnet" | "devnet" | "testnet";
}

/**
 * Function signature for generating explorer links.
 *
 * @param args - Optional arguments specifying what to link to
 * @returns A URL string for the blockchain explorer
 *
 * @example
 * ```ts
 * const link = getExplorerLink({ transaction: "5xY..." });
 * // Returns: "https://explorer.com/tx/5xY..."
 * ```
 */
export type GetExplorerLinkFunction = (args?: GetExplorerLinkArgs) => string;

/**
 * Configuration for building an explorer link function.
 */
export interface ExplorerConfig {
  /**
   * Base URL of the blockchain explorer.
   * @example "https://solscan.io"
   */
  baseUrl: string;

  /**
   * Path segments for different resource types.
   * Defaults to common patterns if not specified.
   */
  paths?: {
    /**
     * Path for transaction links.
     * @default "tx"
     */
    transaction?: string;

    /**
     * Path for address/account links.
     * @default "address"
     */
    address?: string;

    /**
     * Path for block links.
     * @default "block"
     */
    block?: string;
  };

  /**
   * Configuration for cluster/network parameter.
   * If not provided, no cluster parameter will be added to URLs.
   */
  clusterParam?: {
    /**
     * Query parameter name for the cluster.
     * @example "cluster" or "network"
     */
    name: string;

    /**
     * Mapping of cluster names to parameter values.
     * Omit a cluster to not add a parameter for it (useful for mainnet).
     */
    values?: {
      /** Value for devnet cluster */
      devnet?: string;
      /** Value for testnet cluster */
      testnet?: string;
      /** Value for mainnet-beta cluster */
      "mainnet-beta"?: string;
      /** Value for mainnet cluster */
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
  // Set sensible defaults for common explorer URL patterns
  const paths = {
    transaction: config.paths?.transaction ?? "tx",
    address: config.paths?.address ?? "address",
    block: config.paths?.block ?? "block",
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
