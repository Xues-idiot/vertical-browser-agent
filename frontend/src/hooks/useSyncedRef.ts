"use client";

import { useRef, useLayoutEffect } from "react";

export function useSyncedRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

export default useSyncedRef;