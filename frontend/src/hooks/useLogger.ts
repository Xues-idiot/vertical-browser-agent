"use client";

import { useEffect, useRef, useCallback } from "react";

export function useLogger(name: string) {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${name}] mounted`);
    }
  }, [name]);

  const log = useCallback((...logs: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${name}]`, ...logs);
    }
  }, [name]);

  const warn = useCallback((...warnings: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[${name}]`, ...warnings);
    }
  }, [name]);

  const error = useCallback((...errors: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[${name}]`, ...errors);
    }
  }, [name]);

  return { log, warn, error };
}

export default useLogger;