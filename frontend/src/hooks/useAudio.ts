"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAudioOptions {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
}

interface UseAudioReturn {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

export function useAudio(
  src?: string,
  options: UseAudioOptions = {}
): UseAudioReturn {
  const { volume = 1, playbackRate = 1, loop = false } = options;

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stable callbacks defined outside useEffect
  const handleLoadedMetadata = useCallback(() => {
    setDuration(audioRef.current?.duration || 0);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (!loop) {
      setCurrentTime(0);
    }
  }, [loop]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    if (!src) return;

    const audioEl = new Audio(src);
    audioEl.volume = volume;
    audioEl.muted = isMuted;
    audioEl.loop = loop;
    audioEl.playbackRate = playbackRate;

    audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    audioEl.addEventListener("ended", handleEnded);
    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);

    audioRef.current = audioEl;
    setAudio(audioEl);

    return () => {
      audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("ended", handleEnded);
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
      audioEl.pause();
      audioEl.src = "";
    };
  }, [src, loop, playbackRate, volume, isMuted, handleLoadedMetadata, handleTimeUpdate, handleEnded, handlePlay, handlePause]);

  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, []);

  const toggleMuted = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return {
    audio: audioRef.current,
    isPlaying,
    isMuted,
    duration,
    currentTime,
    play,
    pause,
    stop,
    toggle,
    seek,
    setVolume,
    setMuted: toggleMuted,
    setPlaybackRate,
  };
}

export default useAudio;
