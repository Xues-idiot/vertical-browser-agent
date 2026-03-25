"use client";

import { useMediaQuery as useReactMediaQuery } from "./useMediaQuery";

export function useMedia(query: string): boolean {
  return useReactMediaQuery(query);
}

export default useMedia;