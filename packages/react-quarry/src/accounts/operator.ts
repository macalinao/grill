import type { UseDecodedAccountHook } from "@macalinao/grill";
import { createDecodedAccountHook } from "@macalinao/grill";
import { getOperatorDecoder, type Operator } from "@macalinao/quarry";

/**
 * Hook to fetch and decode an Operator account.
 * An Operator has delegated permissions to manage Quarry operations.
 */
export const useOperator: UseDecodedAccountHook<Operator> =
  createDecodedAccountHook<Operator>(getOperatorDecoder());
