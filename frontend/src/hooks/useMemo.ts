"use client";

import { useMemo as useReactMemo } from "react";

export function useMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useReactMemo(factory, deps);
}

export default useMemo;