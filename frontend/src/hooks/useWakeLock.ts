"use client";

import { useState, useEffect, useCallback } from "react";

interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<
    WakeLockSentinel | null
  >(null);

  useEffect(() => {
    setIsSupported("wakeLock" in navigator);
  }, []);

  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const sentinel = await navigator.wakeLock.request("screen");
      setWakeLock(sentinel);
      setIsActive(true);

      sentinel.addEventListener("release", () => {
        setIsActive(false);
        setWakeLock(null);
      });

      return true;
    } catch (err) {
      console.error("Failed to request wake lock:", err);
      return false;
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsActive(false);
      } catch (err) {
        console.error("Failed to release wake lock:", err);
      }
    }
  }, [wakeLock]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        await request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock, request]);

  return {
    isSupported,
    isActive,
    request,
    release,
  };
}

export default useWakeLock;
