"use client";

import { useState } from "react";

export function useConst<T>(initialValue: T | (() => T)): T {
  const [value] = useState(
    initialValue instanceof Function ? initialValue : () => initialValue
  );
  return value;
}

export default useConst;