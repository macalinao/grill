import type { Address } from "@solana/kit";

export type KiteAccountParseResult<T = unknown> = T | null | undefined;

export interface AccountParser<T = unknown> {
  (info: Uint8Array): KiteAccountParseResult<T>;
}

export interface AccountParsers {
  [name: string]: AccountParser;
}

export interface ProgramAccountParsers {
  [programId: string]: AccountParsers;
}

export interface TXHandlers {
  onTXSuccess?: (signature: string) => void | Promise<void>;
}

export interface ParsedAccount<T = unknown> {
  accountId: Address;
  accountInfo: {
    executable: boolean;
    owner: Address;
    lamports: bigint;
    data: T;
    rentEpoch?: bigint;
  };
}