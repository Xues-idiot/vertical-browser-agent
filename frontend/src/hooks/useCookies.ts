"use client";

import { useState, useEffect } from "react";

export function useCookies(): {
  get: (name: string) => string | null;
  set: (name: string, value: string, days?: number) => void;
  remove: (name: string) => void;
} {
  const get = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const set = (name: string, value: string, days = 7) => {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;samesite=strict`;
  };

  const remove = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  };

  return { get, set, remove };
}

export default useCookies;
