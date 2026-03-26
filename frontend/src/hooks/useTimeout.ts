"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useTimeout(callback: () => void, delay: number | null) {
  const [ready, setReady] = useState(false);
  const callbackRef = useRef(callback);

  // Keep callback ref in sync
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleTimeout = useCallback(() => {
    callbackRef.current();
    setReady(true);
  }, []);

  useEffect(() => {
    if (delay === null) {
      setReady(false);
      return;
    }

    setReady(false);
    const timer = setTimeout(handleTimeout, delay);
    return () => clearTimeout(timer);
  }, [delay, handleTimeout]);

  return ready;
}

export default useTimeout;
