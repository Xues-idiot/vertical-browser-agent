"use client";

import { useEffect } from "react";

export function useOnce(effect: React.EffectCallback) {
  useEffect(effect, []);
}

export default useOnce;
