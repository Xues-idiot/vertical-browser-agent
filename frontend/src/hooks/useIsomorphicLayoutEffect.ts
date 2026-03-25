"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted) {
    useLayoutEffect(effect, deps);
  }
}

export default useIsomorphicLayoutEffect;