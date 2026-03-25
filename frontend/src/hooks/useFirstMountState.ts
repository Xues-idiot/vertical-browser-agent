"use client";

import { useState, useEffect } from "react";

export function useFirstMountState(): boolean {
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  return isFirstMount;
}

export default useFirstMountState;