"use client";

import { useState, useEffect } from "react";

export function useTimeout(callback: () => void, delay: number | null) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (delay === null) {
      setReady(false);
      return;
    }

    setReady(false);
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return ready;
}

export default useTimeout;
