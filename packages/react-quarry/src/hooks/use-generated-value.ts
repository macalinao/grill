import { useEffect, useState } from "react";

/**
 * Generates a value continuously, animating it.
 *
 * Warning: this causes the component to re-render extremely frequently, so one should
 * take care to not put this too high up in the component tree.
 *
 * This is specifically useful for rendering reward amounts.
 *
 * @param getter
 * @returns
 */
export const useGeneratedValue = (get: () => number | null): number | null => {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    const doFrame = () => {
      setValue(get());
      if (ctrl.signal.aborted) {
        requestAnimationFrame(doFrame);
      }
    };
    doFrame();
    return () => {
      ctrl.abort();
    };
  }, [get]);
  return value;
};
