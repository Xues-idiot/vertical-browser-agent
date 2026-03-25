"use client";

import { useEffect, useCallback } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyboardOptions {
  onKeyDown?: KeyHandler;
  onKeyUp?: KeyHandler;
  onKeyPress?: KeyHandler;
}

export function useKeyboard(options: UseKeyboardOptions) {
  const { onKeyDown, onKeyUp, onKeyPress } = options;

  useEffect(() => {
    if (onKeyDown) {
      window.addEventListener("keydown", onKeyDown);
    }
    if (onKeyUp) {
      window.addEventListener("keyup", onKeyUp);
    }
    if (onKeyPress) {
      window.addEventListener("keypress", onKeyPress);
    }

    return () => {
      if (onKeyDown) {
        window.removeEventListener("keydown", onKeyDown);
      }
      if (onKeyUp) {
        window.removeEventListener("keyup", onKeyUp);
      }
      if (onKeyPress) {
        window.removeEventListener("keypress", onKeyPress);
      }
    };
  }, [onKeyDown, onKeyUp, onKeyPress]);
}

export function useEscapeKey(onEscape: () => void) {
  const callbackRef = useCallback(onEscape, [onEscape]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callbackRef();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [callbackRef]);
}

export function useEnterKey(onEnter: () => void) {
  const callbackRef = useCallback(onEnter, [onEnter]);

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.repeat) {
        callbackRef();
      }
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [callbackRef]);
}

import { useRef } from "react";

export function useShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { ctrl, shift, alt, meta } = modifiers;

      const ctrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;
      const metaMatch = meta ? event.metaKey : !event.metaKey;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch &&
        metaMatch
      ) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, modifiers]);
}

export default useKeyboard;