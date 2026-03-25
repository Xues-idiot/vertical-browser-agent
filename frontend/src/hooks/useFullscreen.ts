"use client";

import { useState, useCallback, useEffect } from "react";

interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => void;
}

export function useFullscreen(
  targetRef?: React.RefObject<HTMLElement>
): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isSupported = !!(typeof document !== "undefined" &&
    (document.fullscreenEnabled ||
      (document as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
      (document as Document & { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled ||
      (document as Document & { msFullscreenEnabled?: boolean }).msFullscreenEnabled));

  const getFullscreenElement = useCallback((): Element | null => {
    return (
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement ||
      null
    );
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (!isSupported) return;

    const element = targetRef?.current || document.documentElement;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (
        (element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
          .webkitRequestFullscreen
      ) {
        await (
          element as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }
        ).webkitRequestFullscreen();
      } else if (
        (element as HTMLElement & { mozRequestFullScreen?: () => Promise<void> })
          .mozRequestFullScreen
      ) {
        await (
          element as HTMLElement & { mozRequestFullScreen: () => Promise<void> }
        ).mozRequestFullScreen();
      } else if (
        (element as HTMLElement & { msRequestFullscreen?: () => Promise<void> })
          .msRequestFullscreen
      ) {
        await (
          element as HTMLElement & { msRequestFullscreen: () => Promise<void> }
        ).msRequestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  }, [isSupported, targetRef]);

  const exitFullscreen = useCallback(async () => {
    if (!isSupported) return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (
        (document as Document & { webkitExitFullscreen?: () => Promise<void> })
          .webkitExitFullscreen
      ) {
        await (
          document as Document & { webkitExitFullscreen: () => Promise<void> }
        ).webkitExitFullscreen();
      } else if (
        (document as Document & { mozCancelFullScreen?: () => Promise<void> })
          .mozCancelFullScreen
      ) {
        await (
          document as Document & { mozCancelFullScreen: () => Promise<void> }
        ).mozCancelFullScreen();
      } else if (
        (document as Document & { msExitFullscreen?: () => Promise<void> })
          .msExitFullscreen
      ) {
        await (
          document as Document & { msExitFullscreen: () => Promise<void> }
        ).msExitFullscreen();
      }
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, [isSupported]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!getFullscreenElement());
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [getFullscreenElement]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

export default useFullscreen;
