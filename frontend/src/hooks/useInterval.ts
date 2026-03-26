"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseIntervalOptions {
  enabled?: boolean;
}

export function useInterval(
  callback: () => void,
  delay: number | null,
  options: UseIntervalOptions = {}
) {
  const { enabled = true } = options;
  const savedCallback = useRef(callback);
  const delayRef = useRef(delay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => savedCallback.current(), delayRef.current!);
  }, []); // No dependencies - uses refs

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || delay === null) {
      stop();
      return;
    }
    start();
    return stop;
  }, [enabled, delay, start, stop]);

  return { start, stop };
}

export default useInterval;
