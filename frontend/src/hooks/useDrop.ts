"use client";

import { useState, useCallback } from "react";

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

  const dropRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      options.onDragOver?.();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      options.onDragLeave?.();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        options.onDrop?.(files);
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
  }, [options]);

  return { isDragging, dropRef };
}

export default useDrop;