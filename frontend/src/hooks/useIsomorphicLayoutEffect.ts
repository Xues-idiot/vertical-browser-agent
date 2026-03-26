"use client";

import { useEffect, useLayoutEffect } from "react";

export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  // 在SSR环境下使用useEffect，在客户端使用useLayoutEffect
  useEffect(() => {
    // 这是一个空操作，仅用于在客户端水合后切换到useLayoutEffect
    // 实际上我们使用useLayoutEffect，因为它在客户端总是安全的
  }, []);

  // 使用useLayoutEffect（在服务端渲染时useLayoutEffect会被忽略，这是React官方行为）
  useLayoutEffect(effect, deps);
}

export default useIsomorphicLayoutEffect;