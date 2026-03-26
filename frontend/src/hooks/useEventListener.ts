"use client";

import { useEffect, useRef } from "react";

type EventHandler = (event: Event) => void;

export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventTarget | null,
  options?: AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  event: K,
  handler: (event: DocumentEventMap[K]) => void,
  element?: EventTarget | null,
  options?: AddEventListenerOptions
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: HTMLElement | null,
  options?: AddEventListenerOptions
): void;

export function useEventListener(
  event: string,
  handler: EventHandler,
  element?: EventTarget | null,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const elementOrWindow = element ?? (typeof window !== "undefined" ? window : null);
    if (!elementOrWindow) return;

    const listener = (event: Event) => {
      savedHandler.current(event);
    };

    elementOrWindow.addEventListener(event, listener, options);

    return () => {
      elementOrWindow.removeEventListener(event, listener, options);
    };
  }, [event, element, options]);
}

export default useEventListener;