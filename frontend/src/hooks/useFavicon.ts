"use client";

import { useEffect } from "react";

export function useFavicon(href: string) {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) {
      link.href = href;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = href;
      document.head.appendChild(newLink);
    }
  }, [href]);
}

export default useFavicon;