"use client";

import { useState, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10,
    total = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(total);

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const next = useCallback(() => {
    if (hasNext) {
      setPage((p) => p + 1);
    }
  }, [hasNext]);

  const prev = useCallback(() => {
    if (hasPrev) {
      setPage((p) => p - 1);
    }
  }, [hasPrev]);

  const goTo = useCallback((targetPage: number) => {
    const clampedPage = Math.max(1, Math.min(targetPage, totalPages));
    setPage(clampedPage);
  }, [totalPages]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    total: totalCount,
    totalPages,
    startIndex,
    endIndex,
    hasNext,
    hasPrev,
    next,
    prev,
    goTo,
    setPageSize: changePageSize,
    reset,
  };
}