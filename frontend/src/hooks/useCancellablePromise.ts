"use client";

import { useCallback, useRef } from "react";

export function useCancellablePromise() {
  const promisesRef = useRef<Set<Promise<unknown>>>(new Set());

  const createCancellablePromise = useCallback(async <T>(
    promise: Promise<T>
  ): Promise<T> => {
    promisesRef.current.add(promise);

    try {
      const result = await promise;
      promisesRef.current.delete(promise);
      return result;
    } catch (error) {
      promisesRef.current.delete(promise);
      throw error;
    }
  }, []);

  const cancelAll = useCallback(() => {
    promisesRef.current.forEach((promise) => {
      // Note: You can't actually cancel a promise in JavaScript
      // This is just a marker for cleanup tracking
    });
    promisesRef.current.clear();
  }, []);

  return { createCancellablePromise, cancelAll };
}

export default useCancellablePromise;
