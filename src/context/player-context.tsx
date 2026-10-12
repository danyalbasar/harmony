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
import { PlaybackQueue } from "@/lib/playback-queue";
import { AudioPlayback } from "@/lib/audio-playback";
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
  queueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  play: (tracks: TrackWithUrls[], startIndex?: number) => void;
  playNow: (track: TrackWithUrls) => void;
  prepare: (track: TrackWithUrls | undefined) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: TrackWithUrls, playNext?: boolean) => void;
  playQueued: (index: number) => void;
  removeFromQueue: (index: number) => void;
  clearUpcoming: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playbackRef = useRef<AudioPlayback | null>(null);
  const [selection] = useState(() => new PlaybackQueue());
  const [selected, setSelected] = useState(() => selection.snapshot());
  const { current, queue } = selected;
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queueOpen, setQueueOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const publish = useCallback(() => setSelected(selection.snapshot()), [selection]);

  const prepare = useCallback((track: TrackWithUrls | undefined) => {
    playbackRef.current?.prepare(track?.audioUrl);
  }, []);

  const load = useCallback((source: string | undefined, autoplay: boolean, restart = false) => {
    const playback = playbackRef.current;
    if (!playback || !source) return;
    const sameSource = playback.audio.getAttribute("src") === source;
    if (!sameSource) setIsPlaying(false);
    playback.load(source, autoplay, restart);
    setCurrentTime(playback.audio.currentTime);
    setDuration(Number.isFinite(playback.audio.duration) ? playback.audio.duration : 0);
  }, []);

  const next = useCallback(() => {
    const track = selection.next(shuffleRef.current, repeatRef.current === "all");
    publish();
    if (track) load(track.audioUrl, true, true);
    else playbackRef.current?.audio.pause();
  }, [selection, publish, load]);

  useEffect(() => {
    const onEnded = () => {
      const audio = playback.audio;
      setIsPlaying(false);
      if (repeatRef.current === "one") {
        audio.currentTime = 0;
        playback.load(audio.getAttribute("src") ?? undefined, true);
        return;
      }

      next();
    };

    const updateDuration = () => {
      const duration = playback.audio.duration;
      setDuration(Number.isFinite(duration) ? duration : 0);
    };
    const playback = new AudioPlayback({
      timeupdate: () => setCurrentTime(playback.audio.currentTime),
      durationchange: updateDuration,
      loadedmetadata: updateDuration,
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      error: () => setIsPlaying(false),
      ended: onEnded,
    }, () => setIsPlaying(false));
    playbackRef.current = playback;

    return () => {
      playback.dispose();
      playbackRef.current = null;
    };
  }, [next]);

  const play = useCallback((tracks: TrackWithUrls[], startIndex = 0) => {
    const track = selection.start(tracks, startIndex);
    if (!track) return;
    publish();
    load(track.audioUrl, true);
  }, [selection, publish, load]);

  const playQueued = useCallback((index: number) => {
    const track = selection.playQueued(index);
    if (!track) return;
    publish();
    load(track.audioUrl, true, true);
  }, [selection, publish, load]);

  const playNow = useCallback((track: TrackWithUrls) => play([track], 0), [play]);

  useEffect(() => {
    if (current) prepare(selected.next);
  }, [current, selected.next, prepare]);

  const toggle = useCallback(() => {
    playbackRef.current?.toggle();
  }, []);

  const previous = useCallback(() => {
    const audio = playbackRef.current?.audio;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const track = selection.previous();
    if (!track) return;
    publish();
    if (audio && audio.getAttribute("src") === track.audioUrl) audio.currentTime = 0;
    load(track.audioUrl, true);
  }, [selection, publish, load]);

  const seek = useCallback((time: number) => {
    const audio = playbackRef.current?.audio;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.min(Math.max(nextVolume, 0), 1);
    const audio = playbackRef.current?.audio;
    if (audio) {
      audio.volume = clamped;
      audio.muted = clamped === 0;
    }

    setVolumeState(clamped);
    setMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = playbackRef.current?.audio;
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

  const addToQueue = useCallback((track: TrackWithUrls, playNext = false) => {
    selection.enqueue(track, playNext);
    publish();
  }, [selection, publish]);

  const removeFromQueue = useCallback((index: number) => {
    selection.remove(index);
    publish();
  }, [selection, publish]);

  const clearUpcoming = useCallback(() => {
    selection.clear();
    publish();
  }, [selection, publish]);

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
      queueOpen,
      setQueueOpen,
      nowPlayingOpen,
      setNowPlayingOpen,
      play,
      playNow,
      prepare,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playQueued,
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
      queueOpen,
      setQueueOpen,
      nowPlayingOpen,
      setNowPlayingOpen,
      play,
      playNow,
      prepare,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playQueued,
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
