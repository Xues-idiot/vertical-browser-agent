"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  connected: boolean;
  send: (data: any) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
  } = options;

  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const currentOptions = optionsRef.current;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      currentOptions.onOpen?.();
    };

    ws.onclose = () => {
      setConnected(false);
      currentOptions.onClose?.();

      if (currentOptions.reconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, currentOptions.reconnectInterval);
      }
    };

    ws.onerror = (error) => {
      currentOptions.onError?.(error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        currentOptions.onMessage?.(data);
      } catch {
        currentOptions.onMessage?.(event.data);
      }
    };

    wsRef.current = ws;
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }, []);

  const reconnectFn = useCallback(() => {
    disconnect();
    // Small delay to ensure cleanup is complete
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return {
    connected,
    send,
    disconnect,
    reconnect: reconnectFn,
  };
}