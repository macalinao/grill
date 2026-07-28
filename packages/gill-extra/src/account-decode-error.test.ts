import type { Address } from "gill";
import { describe, expect, it } from "bun:test";
import { AccountDecodeError } from "./account-decode-error.js";

const ADDRESS = "So11111111111111111111111111111111111111112" as Address;
const OWNER = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address;

describe("AccountDecodeError", () => {
  it("includes the address, owner, and data length in the message", () => {
    const err = new AccountDecodeError({
      address: ADDRESS,
      programAddress: OWNER,
      data: new Uint8Array(165),
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AccountDecodeError");
    expect(err.message).toBe(
      `Failed to decode account ${ADDRESS} (owner ${OWNER}, 165 bytes)`,
    );
    expect(err.address).toBe(ADDRESS);
    expect(err.programAddress).toBe(OWNER);
    expect(err.dataLength).toBe(165);
  });

  it("degrades gracefully when only the address is known", () => {
    const err = new AccountDecodeError({ address: ADDRESS });
    expect(err.message).toBe(`Failed to decode account ${ADDRESS}`);
    expect(err.programAddress).toBeUndefined();
    expect(err.dataLength).toBeUndefined();
  });

  it("preserves the original error as `cause`", () => {
    const cause = new Error("index out of bounds");
    const err = new AccountDecodeError({ address: ADDRESS }, { cause });
    expect(err.cause).toBe(cause);
  });
});
