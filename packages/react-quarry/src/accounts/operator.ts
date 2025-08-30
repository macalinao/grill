import type {
  UseDecodedAccountHook,
  UseDecodedAccountsHook,
} from "@macalinao/grill";
import type { Operator } from "@macalinao/quarry";
import {
  createDecodedAccountHook,
  createDecodedAccountsHook,
} from "@macalinao/grill";
import { getOperatorDecoder } from "@macalinao/quarry";

/**
 * Hook to fetch and decode an Operator account.
 * An Operator has delegated permissions to manage Quarry operations
 * on behalf of the Rewarder authority.
 *
 * @example
 * ```tsx
 * const { data: operator } = useOperator({
 *   address: operatorAddress
 * });
 * ```
 */
export const useOperator: UseDecodedAccountHook<Operator> =
  createDecodedAccountHook<Operator>(getOperatorDecoder());

/**
 * Hook to fetch and decode multiple Operator accounts in batch.
 * Uses DataLoader for efficient batching of multiple account fetches.
 *
 * @example
 * ```tsx
 * const { data: operators } = useOperators({
 *   addresses: [operator1, operator2]
 * });
 * ```
 */
export const useOperators: UseDecodedAccountsHook<Operator> =
  createDecodedAccountsHook<Operator>(getOperatorDecoder());
