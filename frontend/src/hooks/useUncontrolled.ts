"use client";

import { useState, useCallback } from "react";

interface UseUncontrolledOptions<T> {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}

interface UseUncontrolledReturn<T> {
  value: T;
  setValue: (value: T) => void;
  getValue: () => T;
}

export function useUncontrolled<T>({
  value: valueProp,
  defaultValue,
  onChange,
}: UseUncontrolledOptions<T>): UseUncontrolledReturn<T> {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const getValue = useCallback(() => value, [value]);

  return { value, setValue, getValue };
}

export default useUncontrolled;
