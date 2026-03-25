"use client";

import { useCallback, useRef } from "react";

export function useEffectEvent<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useCallback(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    []
  ) as T;
}

export default useEffectEvent;