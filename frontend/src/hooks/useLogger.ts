"use client";

import { useEffect, useRef } from "react";

export function useLogger(name: string, ...args: unknown[]) {
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

  const log = (...logs: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${name}]`, ...logs);
    }
  };

  const warn = (...warnings: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[${name}]`, ...warnings);
    }
  };

  const error = (...errors: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[${name}]`, ...errors);
    }
  };

  return { log, warn, error };
}

export default useLogger;