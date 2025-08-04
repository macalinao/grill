import type { Address } from "@solana/kit";

export type MastAccountParseResult<T = unknown> = T | null | undefined;

export interface AccountParser<T = unknown> {
  (info: Uint8Array): MastAccountParseResult<T>;
}

export interface AccountParsers {
  [name: string]: AccountParser;
}

export interface ProgramAccountParsers {
  [programId: string]: AccountParsers;
}

export interface TXHandlers {
  onTXSuccess?: (name: string, signature: string) => void | Promise<void>;
  onTXError?: (name: string, error: Error) => void | Promise<void>;
  beforeTX?: (name: string) => void | Promise<void>;
  afterTX?: (name: string, signature: string) => void | Promise<void>;
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