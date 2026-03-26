"use client";

import { useEffect } from "react";

export function useFavicon(href: string) {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const createdLink = !link;

    if (link) {
      link.href = href;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = href;
      document.head.appendChild(newLink);
    }

    return () => {
      if (createdLink) {
        const currentLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (currentLink && currentLink.href === href) {
          currentLink.remove();
        }
      }
    };
  }, [href]);
}

export default useFavicon;