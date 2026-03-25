"use client";

import { useState, useCallback } from "react";

interface UseFocusReturn {
  isFocused: boolean;
  focus: () => void;
  blur: () => void;
  bind: {
    onFocus: () => void;
    onBlur: () => void;
  };
}

export function useFocus(): UseFocusReturn {
  const [isFocused, setIsFocused] = useState(false);

  const focus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const blur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const bind = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return { isFocused, focus, blur, bind };
}

export default useFocus;