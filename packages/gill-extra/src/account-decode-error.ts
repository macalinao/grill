import type { Address, EncodedAccount } from "gill";

/**
 * The subset of an {@link EncodedAccount} needed to describe a decode failure.
 *
 * Both the fetch path (which has a full `EncodedAccount`) and the subscription
 * path (which parses one from a notification) can construct this.
 */
export type DecodableAccount = Pick<EncodedAccount, "address"> &
  Partial<Pick<EncodedAccount, "programAddress" | "data">>;

/**
 * Thrown when an account's raw `data` bytes cannot be decoded with the provided
 * decoder.
 *
 * Decoders throw for a variety of reasons — the account's on-chain layout does
 * not match the decoder (e.g. a stale or wrong-program account at the expected
 * address), the discriminator is unexpected, or the data is truncated. Wrapping
 * those raw failures in this error attaches the account `address` and `owner`
 * (program) so the failure can be traced to a specific on-chain account instead
 * of surfacing as an opaque "index out of bounds"-style message.
 *
 * The original error is available via the standard {@link Error.cause} property.
 */
export class AccountDecodeError extends Error {
  /** Address of the account that failed to decode. */
  readonly address: Address;
  /** Owner (program) of the account, when known. */
  readonly programAddress: Address | undefined;
  /** Length in bytes of the account `data` that failed to decode, when known. */
  readonly dataLength: number | undefined;

  constructor(account: DecodableAccount, options?: { cause?: unknown }) {
    const { address, programAddress, data } = account;
    const dataLength = data?.length;
    const details = [
      programAddress ? `owner ${programAddress}` : undefined,
      dataLength === undefined ? undefined : `${dataLength.toString()} bytes`,
    ].filter(Boolean);
    super(
      `Failed to decode account ${address}${
        details.length > 0 ? ` (${details.join(", ")})` : ""
      }`,
      options,
    );
    this.name = "AccountDecodeError";
    this.address = address;
    this.programAddress = programAddress;
    this.dataLength = dataLength;
  }
}
