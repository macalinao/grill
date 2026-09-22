/**
 * Account storage overhead used when calculating base rent: the number of
 * bytes required to store an account that holds no data.
 */
const ACCOUNT_STORAGE_OVERHEAD = 128n;

/**
 * Amount of time (in years) a balance must cover rent for before the account
 * counts as rent exempt.
 */
const DEFAULT_EXEMPTION_THRESHOLD = 2n;

/**
 * Default rental rate in lamports per byte-year. Derived from:
 * - 10^9 lamports per SOL
 * - $1 per SOL
 * - $0.01 per megabyte day
 * - $3.65 per megabyte year
 */
const DEFAULT_LAMPORTS_PER_BYTE_YEAR = BigInt(
  Math.floor(((1e9 / 100) * 365) / (1024 * 1024)),
);

/**
 * Calculate the total rent needed to create an account, with or without extra
 * data stored in it.
 *
 * This is a local calculation against the network's current rent constants, so
 * it costs no RPC round trip.
 *
 * @param space - Bytes of account data, excluding the storage overhead
 * @returns The minimum lamport balance for the account to be rent exempt
 */
export function getMinimumBalanceForRentExemption(
  space: bigint | number = 0,
): bigint {
  return (
    (ACCOUNT_STORAGE_OVERHEAD + BigInt(space)) *
    DEFAULT_LAMPORTS_PER_BYTE_YEAR *
    DEFAULT_EXEMPTION_THRESHOLD
  );
}
