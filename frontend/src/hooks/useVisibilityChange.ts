"use client";

import { useState, useEffect, useCallback } from "react";

type VisibilityState = DocumentVisibilityState;

interface UseVisibilityChangeReturn {
  isVisible: boolean;
  isHidden: boolean;
  visibilityState: VisibilityState;
}

export function useVisibilityChange(): UseVisibilityChangeReturn {
  const [visibilityState, setVisibilityState] =
    useState<VisibilityState>("visible");

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
    };

    handleVisibilityChange();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return {
    isVisible: visibilityState === "visible",
    isHidden: visibilityState === "hidden",
    visibilityState,
  };
}

export default useVisibilityChange;
