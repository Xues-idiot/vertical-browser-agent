"use client";

import { useRef, useEffect } from "react";

export function useRenderCount(): number {
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current += 1;
  });

  return countRef.current;
}

export default useRenderCount;