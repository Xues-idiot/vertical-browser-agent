"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseCountdownOptions {
  autoStart?: boolean;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  count: number;
  isRunning: boolean;
  start: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: (seconds?: number) => void;
  stop: () => void;
}

export function useCountdown(
  initialSeconds: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const { autoStart = false, onComplete } = options;

  const [count, setCount] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setCount((prev) => {
      if (prev <= 1) {
        clearTimer();
        setIsRunning(false);
        onCompleteRef.current?.();
        return 0;
      }
      return prev - 1;
    });
  }, [clearTimer]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isRunning, tick, clearTimer]);

  const start = useCallback((seconds?: number) => {
    if (seconds !== undefined) {
      setCount(seconds);
    }
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (count > 0) {
      setIsRunning(true);
    }
  }, [count]);

  const reset = useCallback((seconds?: number) => {
    clearTimer();
    setCount(seconds ?? initialSeconds);
    setIsRunning(false);
  }, [clearTimer, initialSeconds]);

  const stop = useCallback(() => {
    clearTimer();
    setCount(0);
    setIsRunning(false);
  }, [clearTimer]);

  return {
    count,
    isRunning,
    start,
    pause,
    resume,
    reset,
    stop,
  };
}