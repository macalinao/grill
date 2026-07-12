import type { RpcApi } from "@solana/kit";
import type {
  DasApiAsset,
  DasApiAssetList,
  GetAssetBatchRequest,
  GetAssetProofBatchRequest,
  GetAssetProofBatchResponse,
  GetAssetProofRequest,
  GetAssetProofResponse,
  GetAssetRequest,
  GetAssetsByAuthorityRequest,
  GetAssetsByCreatorRequest,
  GetAssetsByGroupRequest,
  GetAssetsByOwnerRequest,
  GetNftEditionsRequest,
  GetNftEditionsResponse,
  GetSignaturesForAssetRequest,
  GetSignaturesForAssetResponse,
  GetTokenAccountsRequest,
  GetTokenAccountsResponse,
  SearchAssetsRequest,
} from "./types/index.js";
import { createJsonRpcApi } from "@solana/kit";
import { dasApiRequestTransformer } from "./request-transformer.js";
import { dasApiResponseTransformer } from "./response-transformer.js";

/**
 * The Digital Asset Standard (DAS) API method set, adapted for `@solana/kit`.
 *
 * This covers the Metaplex DAS API along with the Helius DAS API extensions
 * (`getAssetBatch`, `getAssetProofBatch`, `getSignaturesForAsset`,
 * `getTokenAccounts`, `getNftEditions`).
 */
export interface SolanaDasApi {
  /** Get a single asset by its id. */
  getAsset(input: GetAssetRequest): DasApiAsset;
  /** Get multiple assets by their ids. */
  getAssetBatch(input: GetAssetBatchRequest): (DasApiAsset | null)[];
  /** Get a merkle proof for a compressed asset. */
  getAssetProof(input: GetAssetProofRequest): GetAssetProofResponse;
  /** Get merkle proofs for multiple compressed assets. */
  getAssetProofBatch(
    input: GetAssetProofBatchRequest,
  ): GetAssetProofBatchResponse;
  /** Get a paginated list of assets owned by an address. */
  getAssetsByOwner(input: GetAssetsByOwnerRequest): DasApiAssetList;
  /** Get a paginated list of assets controlled by an authority. */
  getAssetsByAuthority(input: GetAssetsByAuthorityRequest): DasApiAssetList;
  /** Get a paginated list of assets created by an address. */
  getAssetsByCreator(input: GetAssetsByCreatorRequest): DasApiAssetList;
  /** Get a paginated list of assets belonging to a group. */
  getAssetsByGroup(input: GetAssetsByGroupRequest): DasApiAssetList;
  /** Search for assets matching a set of criteria. */
  searchAssets(input: SearchAssetsRequest): DasApiAssetList;
  /** Get the transaction signatures associated with an asset. */
  getSignaturesForAsset(
    input: GetSignaturesForAssetRequest,
  ): GetSignaturesForAssetResponse;
  /** Get token accounts by owner and/or mint (Helius extension). */
  getTokenAccounts(input: GetTokenAccountsRequest): GetTokenAccountsResponse;
  /** Get the printed editions of a master edition NFT (Helius extension). */
  getNftEditions(input: GetNftEditionsRequest): GetNftEditionsResponse;
}

/**
 * Creates the DAS API JSON-RPC API definition.
 *
 * The returned {@link RpcApi} maps each DAS method to a JSON-RPC call with
 * named parameters, and unwraps the JSON-RPC envelope on the way back (throwing
 * a `DasApiError` on error responses). Combine it with a transport via
 * `createRpc`, or use {@link createDasRpc} for a batteries-included client.
 */
export function createDasApi(): RpcApi<SolanaDasApi> {
  // `createJsonRpcApi`'s type parameter requires an implicit index signature,
  // which interfaces (unlike type aliases) do not provide. The returned proxy
  // handles any method, so we build it untyped and assert the concrete API.
  return createJsonRpcApi({
    requestTransformer: dasApiRequestTransformer,
    responseTransformer: dasApiResponseTransformer,
  }) as RpcApi<SolanaDasApi>;
}
