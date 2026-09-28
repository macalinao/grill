import type { SolanaClusterMoniker } from "./solana-client.js";

/**
 * Arguments for {@link getExplorerLink}.
 *
 * At most one of `address`, `transaction` or `block` is used, in that order of
 * precedence. Passing none of them links to the explorer's home page.
 */
export interface GetSolanaExplorerLinkArgs {
  /** Account address to link to. */
  address?: string;
  /** Transaction signature to link to. */
  transaction?: string;
  /** Block number or slot to link to. */
  block?: string | number;
  /**
   * Cluster the link should point at.
   *
   * @default "mainnet-beta"
   */
  cluster?: SolanaClusterMoniker | "mainnet-beta" | "localhost";
}

/**
 * Craft a Solana Explorer link on any cluster.
 *
 * Non-mainnet clusters are selected with the explorer's `cluster` query
 * parameter. A local validator has no explorer cluster of its own, so it is
 * addressed as `cluster=custom` pointed at `http://localhost:8899`.
 *
 * @param props - What to link to, and on which cluster
 * @returns The explorer URL
 */
export function getExplorerLink(props: GetSolanaExplorerLinkArgs = {}): string {
  const url = new URL("https://explorer.solana.com");
  const cluster =
    props.cluster === undefined || props.cluster === "mainnet"
      ? "mainnet-beta"
      : props.cluster;

  if (props.address !== undefined) {
    url.pathname = `/address/${props.address}`;
  } else if (props.transaction !== undefined) {
    url.pathname = `/tx/${props.transaction}`;
  } else if (props.block !== undefined) {
    url.pathname = `/block/${props.block}`;
  }

  if (cluster !== "mainnet-beta") {
    if (cluster === "localnet" || cluster === "localhost") {
      url.searchParams.set("cluster", "custom");
      url.searchParams.set("customUrl", "http://localhost:8899");
    } else {
      url.searchParams.set("cluster", cluster);
    }
  }

  return url.toString();
}
