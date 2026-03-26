"use client";

import { useEffect, useCallback, useRef } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyboardOptions {
  onKeyDown?: KeyHandler;
  onKeyUp?: KeyHandler;
  onKeyPress?: KeyHandler;
}

export function useKeyboard(options: UseKeyboardOptions) {
  const { onKeyDown, onKeyUp, onKeyPress } = options;
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const onKeyDown = optionsRef.current.onKeyDown;
    const onKeyUp = optionsRef.current.onKeyUp;
    const onKeyPress = optionsRef.current.onKeyPress;

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
  }, []);
}

export function useEscapeKey(onEscape: () => void) {
  const callbackRef = useRef(onEscape);

  useEffect(() => {
    callbackRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);
}

export function useEnterKey(onEnter: () => void) {
  const callbackRef = useRef(onEnter);

  useEffect(() => {
    callbackRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.repeat) {
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, []);
}

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

      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : true;
      const shiftMatch = shift ? event.shiftKey : true;
      const altMatch = alt ? event.altKey : true;
      const metaMatch = meta ? event.metaKey : true;

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
  }, [key, modifiers?.ctrl, modifiers?.shift, modifiers?.alt, modifiers?.meta]);
}

export default useKeyboard;