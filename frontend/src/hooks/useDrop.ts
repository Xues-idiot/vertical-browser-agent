"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface DropOptions {
  onDrop?: (files: File[]) => void;
  onDragOver?: () => void;
  onDragLeave?: () => void;
}

interface UseDropReturn {
  isDragging: boolean;
  dropRef: (node: HTMLElement | null) => void;
}

export function useDrop(options: DropOptions = {}): UseDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const optionsRef = useRef(options);
  const nodeRef = useRef<HTMLElement | null>(null);

  // Keep options ref in sync
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      optionsRef.current.onDragOver?.();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      optionsRef.current.onDragLeave?.();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        optionsRef.current.onDrop?.(files);
      }
    };

    node.addEventListener("dragover", handleDragOver);
    node.addEventListener("dragleave", handleDragLeave);
    node.addEventListener("drop", handleDrop);

    return () => {
      node.removeEventListener("dragover", handleDragOver);
      node.removeEventListener("dragleave", handleDragLeave);
      node.removeEventListener("drop", handleDrop);
    };
  }, []); // Only run once on mount, nodeRef is managed via ref callback

  const dropRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return { isDragging, dropRef };
}

export default useDrop;