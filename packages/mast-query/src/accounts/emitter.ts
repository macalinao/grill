import type { Address } from "@solana/kit";
import { EventEmitter } from "eventemitter3";

export interface CacheBatchUpdateEvent {
  type: "batchUpdate";
  keys: Set<Address>;
}

export interface CacheClearEvent {
  type: "clear";
}

export type CacheEvent = CacheBatchUpdateEvent | CacheClearEvent;

interface CacheEventTypes {
  change: (event: CacheEvent) => void;
}

export class AccountsEmitter extends EventEmitter<CacheEventTypes> {
  emitBatchUpdate(keys: Set<Address>): void {
    this.emit("change", { type: "batchUpdate", keys });
  }

  emitClear(): void {
    this.emit("change", { type: "clear" });
  }

  // Legacy method names for backwards compatibility
  raiseBatchCacheUpdated(keys: Set<string>): void {
    this.emitBatchUpdate(keys as Set<Address>);
  }

  raiseCacheCleared(): void {
    this.emitClear();
  }

  onBatchCache(cb: (args: CacheBatchUpdateEvent) => void): void {
    this.on("change", (event) => {
      if (event.type === "batchUpdate") {
        cb(event);
      }
    });
  }
}
