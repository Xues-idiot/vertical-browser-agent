"use client";

import { useState, useCallback } from "react";

interface UseCopyToClipboardReturn {
  copiedText: string | null;
  copy: (text: string) => Promise<boolean>;
  isCopied: boolean;
  reset: () => void;
}

export function useCopyToClipboard(
  resetDelay = 2000
): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
        }
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), resetDelay);
        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        setCopiedText(null);
        return false;
      }
    },
    [resetDelay]
  );

  const reset = useCallback(() => {
    setCopiedText(null);
  }, []);

  return {
    copiedText,
    copy,
    isCopied: copiedText !== null,
    reset,
  };
}

export default useCopyToClipboard;
