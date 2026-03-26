"use client";

import { useState, useRef, useCallback } from "react";

export function useHover(): [boolean, (node?: HTMLElement | null) => void] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const attachRef = useCallback((node?: HTMLElement | null) => {
    if (ref.current) {
      ref.current.removeEventListener("mouseenter", handleMouseEnter);
      ref.current.removeEventListener("mouseleave", handleMouseLeave);
    }

    ref.current = node ?? null;

    if (ref.current) {
      ref.current.addEventListener("mouseenter", handleMouseEnter);
      ref.current.addEventListener("mouseleave", handleMouseLeave);
    }
  }, [handleMouseEnter, handleMouseLeave]);

  return [isHovered, attachRef];
}

export default useHover;
