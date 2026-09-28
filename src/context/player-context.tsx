"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrackWithUrls } from "@/lib/tracks";

export type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  current: TrackWithUrls | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: TrackWithUrls[];
  queueIndex: number;
  queueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  play: (tracks: TrackWithUrls[], startIndex?: number) => void;
  playNow: (track: TrackWithUrls) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: TrackWithUrls) => void;
  removeFromQueue: (index: number) => void;
  clearUpcoming: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function shuffled(length: number) {
  const order = Array.from({ length }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }

  return order;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<TrackWithUrls[]>([]);
  const indexRef = useRef(-1);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");
  const orderRef = useRef<number[]>([]);

  const [queue, setQueueState] = useState<TrackWithUrls[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queueOpen, setQueueOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const setQueue = useCallback((next: TrackWithUrls[]) => {
    queueRef.current = next;
    orderRef.current = next.length > 1 ? shuffled(next.length) : next.map((_, index) => index);
    setQueueState(next);
  }, []);

  const setIndex = useCallback((next: number) => {
    indexRef.current = next;
    setQueueIndex(next);
  }, []);

  const load = useCallback(
    (source: string | undefined, autoplay: boolean) => {
      const audio = audioRef.current;
      if (!audio || !source) return;

      setCurrentTime(0);
      audio.src = source;
      audio.load();

      if (autoplay) {
        void audio.play().catch(() => setIsPlaying(false));
      }
    },
    [],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      durationchange: () =>
        setDuration(Number.isFinite(audio.duration) ? audio.duration : 0),
      loadedmetadata: () =>
        setDuration(Number.isFinite(audio.duration) ? audio.duration : 0),
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
    };

    const onEnded = () => {
      if (repeatRef.current === "one") {
        audio.currentTime = 0;
        void audio.play().catch(() => setIsPlaying(false));
        return;
      }

      const items = queueRef.current;
      const index = indexRef.current;

      if (shuffleRef.current && orderRef.current.length > 0) {
        const currentId = items[index]?.id;
        const candidates = orderRef.current.filter((i) => items[i]?.id !== currentId);

        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          setIndex(pick);
          load(items[pick]?.audioUrl, true);
          return;
        }
      }

      if (index + 1 < items.length) {
        setIndex(index + 1);
        load(items[index + 1]?.audioUrl, true);
        return;
      }

      if (repeatRef.current === "all" && items.length > 0) {
        setIndex(0);
        load(items[0]?.audioUrl, true);
        return;
      }

      audio.pause();
    };

    audio.addEventListener("timeupdate", handlers.timeupdate);
    audio.addEventListener("durationchange", handlers.durationchange);
    audio.addEventListener("loadedmetadata", handlers.loadedmetadata);
    audio.addEventListener("play", handlers.play);
    audio.addEventListener("pause", handlers.pause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handlers.timeupdate);
      audio.removeEventListener("durationchange", handlers.durationchange);
      audio.removeEventListener("loadedmetadata", handlers.loadedmetadata);
      audio.removeEventListener("play", handlers.play);
      audio.removeEventListener("pause", handlers.pause);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [load, setIndex]);

  const play = useCallback(
    (tracks: TrackWithUrls[], startIndex = 0) => {
      if (tracks.length === 0) return;

      setQueue(tracks);
      setIndex(startIndex);
      load(tracks[startIndex]?.audioUrl, true);
    },
    [load, setIndex, setQueue],
  );

  const playNow = useCallback((track: TrackWithUrls) => play([track], 0), [play]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    const items = queueRef.current;
    const index = indexRef.current;

    if (items.length === 0) return;

    if (index + 1 < items.length) {
      setIndex(index + 1);
      load(items[index + 1]?.audioUrl, true);
      return;
    }

    if (repeatRef.current === "all") {
      setIndex(0);
      load(items[0]?.audioUrl, true);
      return;
    }

    audioRef.current?.pause();
  }, [load, setIndex]);

  const previous = useCallback(() => {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const items = queueRef.current;
    const index = indexRef.current;
    if (items.length === 0) return;

    const target = Math.max(index - 1, 0);
    setIndex(target);
    load(items[target]?.audioUrl, true);
  }, [load, setIndex]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.min(Math.max(nextVolume, 0), 1);
    const audio = audioRef.current;
    if (audio) audio.volume = clamped;

    setVolumeState(clamped);
    setMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = !audio.muted;
    setMuted((value) => !value);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((value) => {
      shuffleRef.current = !value;
      return shuffleRef.current;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((mode) => {
      const nextMode: RepeatMode = mode === "off" ? "all" : mode === "all" ? "one" : "off";
      repeatRef.current = nextMode;
      return nextMode;
    });
  }, []);

  const addToQueue = useCallback(
    (track: TrackWithUrls) => {
      const items = queueRef.current;

      if (items.length === 0) {
        setQueue([track]);
        setIndex(0);
        load(track.audioUrl, true);
        return;
      }

      setQueue([...items.filter((item) => item.id !== track.id), track]);
    },
    [load, setIndex, setQueue],
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      const items = queueRef.current;
      const currentIndex = indexRef.current;

      setQueue(items.filter((_, position) => position !== index));

      if (index < currentIndex) {
        setIndex(currentIndex - 1);
      } else if (index === currentIndex) {
        setIndex(Math.min(currentIndex, items.length - 2));
      }
    },
    [setIndex, setQueue],
  );

  const clearUpcoming = useCallback(() => {
    const index = indexRef.current;
    setQueue(queueRef.current.slice(0, index + 1));
  }, [setQueue]);

  const current = queueIndex >= 0 ? (queue[queueIndex] ?? null) : null;

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      queue,
      queueIndex,
      queueOpen,
      setQueueOpen,
      nowPlayingOpen,
      setNowPlayingOpen,
      play,
      playNow,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      removeFromQueue,
      clearUpcoming,
    }),
    [
      current,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      queue,
      queueIndex,
      queueOpen,
      setQueueOpen,
      nowPlayingOpen,
      setNowPlayingOpen,
      play,
      playNow,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      removeFromQueue,
      clearUpcoming,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }

  return context;
}
