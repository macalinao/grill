import type { Address } from "@solana/kit";
import { useEffect, useRef } from "react";

import { useKite } from "../provider";

export const useAccountsSubscribe = (
  accountIds: Address[],
  callback: (changedAccounts: Set<Address>) => void,
): void => {
  const { emitter } = useKite();
  const callbackRef = useRef(callback);
  
  // Update callback ref to avoid stale closures
  callbackRef.current = callback;

  useEffect(() => {
    if (accountIds.length === 0) return;

    const accountSet = new Set(accountIds);
    
    const handleChange = (event: { type: string; keys?: Set<Address> }) => {
      if (event.type === "clear") {
        callbackRef.current(accountSet);
        return;
      }
      
      if (event.type === "batchUpdate" && event.keys) {
        const changedAccounts = new Set<Address>();
        event.keys.forEach((key) => {
          if (accountSet.has(key)) {
            changedAccounts.add(key);
          }
        });
        
        if (changedAccounts.size > 0) {
          callbackRef.current(changedAccounts);
        }
      }
    };

    emitter.on("change", handleChange);
    return () => {
      emitter.off("change", handleChange);
    };
  }, [accountIds, emitter]);
};