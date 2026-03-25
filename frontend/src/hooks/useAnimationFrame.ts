"use client";

import { useRef, useEffect, useCallback } from "react";

type Timestamp = number;
type FrameRequestCallback = (timestamp: Timestamp) => void;

interface UseAnimationFrameReturn {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  restart: () => void;
}

export function useAnimationFrame(
  callback: FrameRequestCallback,
  autoStart = false
): UseAnimationFrameReturn {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<Timestamp | null>(null);
  const isRunningRef = useRef(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = useCallback((time: Timestamp) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = time - previousTimeRef.current;
      callbackRef.current(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    previousTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    isRunningRef.current = false;
    previousTimeRef.current = null;
  }, []);

  const restart = useCallback(() => {
    stop();
    start();
  }, [stop, start]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    isRunning: isRunningRef.current,
    start,
    stop,
    restart,
  };
}

export default useAnimationFrame;
