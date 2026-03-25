"use client";

import { useState, useEffect } from "react";

type ScriptStatus = "idle" | "loading" | "ready" | "error";

interface UseScriptOptions {
  shouldLoad?: boolean;
}

interface UseScriptReturn {
  status: ScriptStatus;
  error: Error | null;
}

export function useScript(
  src: string,
  options: UseScriptOptions = {}
): UseScriptReturn {
  const { shouldLoad = true } = options;

  const [status, setStatus] = useState<ScriptStatus>(
    shouldLoad ? "loading" : "idle"
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!shouldLoad) {
      setStatus("idle");
      return;
    }

    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (existingScript) {
      setStatus("ready");
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    const handleLoad = () => setStatus("ready");
    const handleError = () => {
      setStatus("error");
      setError(new Error(`Failed to load script: ${src}`));
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [src, shouldLoad]);

  return { status, error };
}

export default useScript;
