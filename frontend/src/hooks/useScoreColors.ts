"use client";

import { useState, useCallback, useMemo } from "react";

interface ScoreThreshold {
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const defaultThresholds: ScoreThreshold[] = [
  {
    label: "优秀",
    minScore: 80,
    maxScore: 100,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500",
    borderColor: "border-emerald-500",
  },
  {
    label: "良好",
    minScore: 60,
    maxScore: 79,
    color: "text-amber-400",
    bgColor: "bg-amber-500",
    borderColor: "border-amber-500",
  },
  {
    label: "一般",
    minScore: 0,
    maxScore: 59,
    color: "text-red-400",
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
  },
];

export function useScoreColors(initialThresholds?: ScoreThreshold[]) {
  const [thresholds, setThresholds] = useState<ScoreThreshold[]>(
    initialThresholds || defaultThresholds
  );

  const getScoreStyle = useCallback(
    (score: number): ScoreThreshold => {
      const threshold = thresholds.find(
        (t) => score >= t.minScore && score <= t.maxScore
      );
      return threshold || thresholds[thresholds.length - 1];
    },
    [thresholds]
  );

  const updateThreshold = useCallback(
    (index: number, updates: Partial<ScoreThreshold>) => {
      setThresholds((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    []
  );

  const resetToDefault = useCallback(() => {
    setThresholds(defaultThresholds);
  }, []);

  const scoreColors = useMemo(
    () => ({
      thresholds,
      getScoreStyle,
      updateThreshold,
      resetToDefault,
    }),
    [thresholds, getScoreStyle, updateThreshold, resetToDefault]
  );

  return scoreColors;
}

export type { ScoreThreshold };
export default useScoreColors;
