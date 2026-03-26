"use client";

import { useRef } from "react";

export function useRenderCount(): number {
  const countRef = useRef(0);
  // 直接在渲染期间递增，这样更准确
  countRef.current += 1;
  return countRef.current;
}

export default useRenderCount;