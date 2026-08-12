import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const MOBILE_QUERY = `(max-width: ${(MOBILE_BREAKPOINT - 1).toString()}px)`;

const subscribe = (onStoreChange: () => void): (() => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => {
    mql.removeEventListener("change", onStoreChange);
  };
};

const getSnapshot = (): boolean => window.innerWidth < MOBILE_BREAKPOINT;

// There is no viewport to measure outside the browser; matches the `false` the
// previous `useState<boolean | undefined>(undefined)` implementation returned
// on the first render.
const getServerSnapshot = (): boolean => false;

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
