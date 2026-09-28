import type {
  ClientWithRpc,
  ClientWithRpcSubscriptions,
  Signature,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";

export type TransactionId = string;

export type TransactionStatusEvent = {
  title: string;
  id: TransactionId;
} & (
  | {
      type: "error-wallet-not-connected";
    }
  | {
      type: "preparing";
    }
  | {
      type: "awaiting-wallet-signature";
    }
  | {
      type: "signed";
    }
  | {
      type: "error-transaction-send-failed";
      errorMessage: string;
    }
  | {
      type: "error-transaction-sign-failed";
      errorMessage: string;
    }
  | {
      type: "waiting-for-confirmation";
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "confirmed";
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "error-transaction-failed";
      errorMessage: string;
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "error-simulation-failed";
      errorMessage: string;
    }
);

export type TransactionStatusEventCallback = (
  e: TransactionStatusEvent,
) => void;

/**
 * The kit client grill needs: an `rpc` and an `rpcSubscriptions` connection.
 *
 * Any kit client with those two capabilities satisfies it -- for example
 * `createClient().use(solanaRpcConnection({ rpcUrl }))` from
 * `@solana/kit-plugin-rpc`, or a fuller `solanaRpc(...)` client with extra
 * plugins installed. Provide it with `ClientProvider` from `@solana/react`.
 *
 * The RPC is typed with `SolanaRpcApiMainnet` -- the methods every cluster
 * serves -- so clients for any cluster, including mainnet-branded ones built
 * from `getPublicSolanaRpcUrl("mainnet")` (which lack `requestAirdrop`), are
 * assignable.
 */
export type GrillClient = ClientWithRpc<SolanaRpcApiMainnet> &
  ClientWithRpcSubscriptions<SolanaRpcSubscriptionsApi>;
