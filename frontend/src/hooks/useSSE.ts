"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SSEOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}

interface SSEReturn {
  connected: boolean;
  data: any;
  error: Event | null;
  connect: () => void;
  disconnect: () => void;
}

export function useSSE(options: SSEOptions): SSEReturn {
  const { url, autoConnect = true } = options;

  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        optionsRef.current.onMessage?.(parsedData);
      } catch {
        setData(event.data);
        optionsRef.current.onMessage?.(event.data);
      }
    };

    eventSource.onerror = (err) => {
      setConnected(false);
      setError(err);
      optionsRef.current.onError?.(err);
    };

    eventSourceRef.current = eventSource;
  }, [url]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect]);

  return {
    connected,
    data,
    error,
    connect,
    disconnect,
  };
}