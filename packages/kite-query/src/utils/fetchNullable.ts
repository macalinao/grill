import type { Address, GetAccountInfoApi, Rpc } from "@solana/kit";

export async function fetchNullable<T extends GetAccountInfoApi>(
  rpc: Rpc<T>,
  accountId: Address,
  commitment: "confirmed" | "finalized" = "confirmed",
) {
  try {
    const result = await rpc
      .getAccountInfo(accountId, {
        commitment,
        encoding: "base64",
      })
      .send();
    return result.value;
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes("could not find account")
    ) {
      return null;
    }
    throw e;
  }
}