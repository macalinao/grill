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
 * An Operator has delegated permissions to manage Quarry operations.
 */
export const useOperator: UseDecodedAccountHook<Operator> =
  createDecodedAccountHook<Operator>(getOperatorDecoder());

export const useOperators: UseDecodedAccountsHook<Operator> =
  createDecodedAccountsHook<Operator>(getOperatorDecoder());
