"use client";

import { useState, useEffect, useRef } from "react";

interface UseIntersectionOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

interface UseIntersectionReturn {
  ref: React.RefObject<HTMLElement | null>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersection(
  options: UseIntersectionOptions = {}
): UseIntersectionReturn {
  const {
    threshold = 0,
    root = null,
    rootMargin = "0%",
    freezeOnceVisible = false,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = useRef(false);

  const isIntersecting = entry?.isIntersecting ?? false;

  useEffect(() => {
    const node = ref.current;
    if (!node || (frozen.current && freezeOnceVisible)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return { ref: ref as React.RefObject<HTMLElement | null>, isIntersecting, entry };
}