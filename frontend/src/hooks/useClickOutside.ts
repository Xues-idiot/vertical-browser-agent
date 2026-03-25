"use client";

import { useEffect, useRef, useCallback } from "react";

type ClickOutsideCallback = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside(
  callback: ClickOutsideCallback,
  enabled: boolean = true
) {
  const ref = useRef<HTMLElement>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        callbackRef.current(event);
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [enabled, handleClick]);

  return ref;
}