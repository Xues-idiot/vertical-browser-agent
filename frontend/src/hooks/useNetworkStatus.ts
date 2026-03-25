"use client";

import { useState, useEffect } from "react";

type NetworkStatus = "online" | "offline";

interface UseNetworkStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  isSlowConnection: boolean;
  effectiveType: string | null;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>(
    typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [effectiveType, setEffectiveType] = useState<string | null>(null);

  useEffect(() => {
    interface NetworkInformation extends EventTarget {
      effectiveType?: string;
      addEventListener(type: string, listener: () => void): void;
      removeEventListener(type: string, listener: () => void): void;
    }
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

    const updateConnectionInfo = () => {
      if (connection) {
        setEffectiveType(connection.effectiveType || null);
      }
    };

    const handleOnline = () => {
      setStatus("online");
      setWasOffline(false);
    };

    const handleOffline = () => {
      setStatus("offline");
      setWasOffline(true);
    };

    if (connection) {
      updateConnectionInfo();
      connection.addEventListener("change", updateConnectionInfo);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (connection) {
        connection.removeEventListener("change", updateConnectionInfo);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline: status === "online",
    isOffline: status === "offline",
    wasOffline,
    isSlowConnection: effectiveType === "2g" || effectiveType === "slow-2g",
    effectiveType,
  };
}

export default useNetworkStatus;
