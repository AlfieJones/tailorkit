import { useRef } from "react";

/** Keep equivalent JSON context values stable without requiring callers to memoize. */
export function useStableContext<T>(value: T): T {
  const key = JSON.stringify(value);
  const ref = useRef({ key, value });
  if (ref.current.key !== key) {
    ref.current = { key, value };
  }
  return ref.current.value;
}
