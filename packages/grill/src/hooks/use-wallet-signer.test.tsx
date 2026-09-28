import type {
  Address,
  Client,
  TransactionSendingSigner,
  TransactionSigner,
} from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { address, createClient } from "@solana/kit";
import { ClientProvider } from "@solana/react";
import { renderToStaticMarkup } from "react-dom/server";
import { reactiveSigner } from "../plugins/reactive-signer.js";
import { useConnectedWallet } from "./use-connected-wallet.js";
import { useWalletSigner } from "./use-wallet-signer.js";

const ADDRESS = address("11111111111111111111111111111111");

const SENDING_SIGNER: TransactionSendingSigner<Address> = {
  address: ADDRESS,
  signAndSendTransactions: () => Promise.resolve([]),
};

const PARTIAL_ONLY_SIGNER: TransactionSigner = {
  address: ADDRESS,
  signTransactions: () => Promise.resolve([]),
};

const ShowSigner = (): React.ReactElement => {
  const signer = useWalletSigner();
  return <span>{signer ? signer.address : "none"}</span>;
};

const ShowConnected = (): React.ReactElement => {
  const signer = useConnectedWallet();
  return <span>{signer.address}</span>;
};

function render(client: Client<object>, children: React.ReactNode): string {
  return renderToStaticMarkup(
    <ClientProvider client={client}>{children}</ClientProvider>,
  );
}

describe("useWalletSigner", () => {
  it("returns the client's payer when it is a sending signer", () => {
    const client = createClient().use(reactiveSigner(SENDING_SIGNER));
    expect(render(client, <ShowSigner />)).toBe(`<span>${ADDRESS}</span>`);
  });

  it("returns null while the reactive signer is empty", () => {
    const client = createClient().use(reactiveSigner());
    expect(render(client, <ShowSigner />)).toBe("<span>none</span>");
  });

  it("returns null when the client has no payer capability", () => {
    expect(render(createClient(), <ShowSigner />)).toBe("<span>none</span>");
  });

  it("returns null when the payer cannot send transactions", () => {
    expect(
      render(createClient({ payer: PARTIAL_ONLY_SIGNER }), <ShowSigner />),
    ).toBe("<span>none</span>");
  });
});

describe("useConnectedWallet", () => {
  it("returns the connected signer", () => {
    const client = createClient().use(reactiveSigner(SENDING_SIGNER));
    expect(render(client, <ShowConnected />)).toBe(`<span>${ADDRESS}</span>`);
  });

  it("throws when no wallet is connected", () => {
    const client = createClient().use(reactiveSigner());
    expect(() => render(client, <ShowConnected />)).toThrow(
      "Wallet is not connected",
    );
  });
});
