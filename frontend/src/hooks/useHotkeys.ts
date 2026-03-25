"use client";

import { useEffect, useCallback, useRef } from "react";

interface HotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

interface HotkeyDefinition {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export function useHotkeys(
  hotkeys: Array<{ key: HotkeyDefinition; handler: () => void; options?: HotkeyOptions }>
) {
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const { key, handler, options = {} } of hotkeysRef.current) {
        if (options.enabled === false) continue;

        const ctrlMatch = key.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = key.alt ? event.altKey : !event.altKey;
        const shiftMatch = key.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === key.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          if (options.preventDefault) {
            event.preventDefault();
          }
          handler();
        }
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);
}

export default useHotkeys;
