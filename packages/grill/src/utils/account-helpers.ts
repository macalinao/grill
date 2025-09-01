export const GRILL_HOOK_CLIENT_KEY = "solana";

/**
 * Create a query key for the account query
 * @param address - The address of the account
 * @returns The query key
 */
export const createAccountQueryKey = (
  address: string,
): readonly [string, string, string] =>
  [GRILL_HOOK_CLIENT_KEY, "account", address] as const;
