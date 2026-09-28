"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createSleepEngine,
  DEFAULT_PRESET_ID,
  DEFAULT_SLEEP_VOLUME,
  getPreset,
  type SleepEngine,
  type SleepPreset,
  type SleepSoundId,
} from "@/lib/sleep-sounds";

const STORAGE_KEY = "harmony.sleep";

type Stored = { preset: SleepSoundId; volume: number };

type SleepContextValue = {
  playing: boolean;
  preset: SleepPreset;
  volume: number;
  supported: boolean;
  toggle: () => void;
  play: () => void;
  stop: () => void;
  select: (id: SleepSoundId) => void;
  setVolume: (volume: number) => void;
};

const SleepContext = createContext<SleepContextValue | null>(null);

function readStored(): Stored {
  if (typeof window === "undefined") {
    return { preset: DEFAULT_PRESET_ID, volume: DEFAULT_SLEEP_VOLUME };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { preset: DEFAULT_PRESET_ID, volume: DEFAULT_SLEEP_VOLUME };

    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      preset: getPreset(parsed.preset).id,
      volume:
        typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 1
          ? parsed.volume
          : DEFAULT_SLEEP_VOLUME,
    };
  } catch {
    return { preset: DEFAULT_PRESET_ID, volume: DEFAULT_SLEEP_VOLUME };
  }
}

export function SleepProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<Stored>(readStored);
  const [playing, setPlaying] = useState(false);
  const [supported] = useState(
    () => typeof window === "undefined" || "AudioContext" in window,
  );

  const contextRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<SleepEngine | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Private browsing can refuse writes; not worth surfacing.
    }
  }, [stored]);

  const ensureEngine = useCallback(() => {
    if (engineRef.current) return engineRef.current;

    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;

    contextRef.current = new AudioCtor();
    engineRef.current = createSleepEngine(
      contextRef.current,
      getPreset(stored.preset),
      stored.volume,
    );

    return engineRef.current;
  }, [stored.preset, stored.volume]);

  const play = useCallback(() => {
    const engine = ensureEngine();
    if (!engine) return;

    if (contextRef.current?.state === "suspended") {
      void contextRef.current.resume();
    }

    engine.fadeIn();
    setPlaying(true);
  }, [ensureEngine]);

  const stop = useCallback(() => {
    engineRef.current?.fadeOut();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (engineRef.current?.playing) {
      stop();
    } else {
      play();
    }
  }, [play, stop]);

  const select = useCallback(
    (id: SleepSoundId) => {
      const preset = getPreset(id);
      setStored((current) => ({ ...current, preset: preset.id }));
      engineRef.current?.setPreset(preset);
    },
    [],
  );

  const setVolume = useCallback((volume: number) => {
    setStored((current) => ({ ...current, volume }));
    engineRef.current?.setVolume(volume);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      contextRef.current?.close();
    };
  }, []);

  const value = useMemo<SleepContextValue>(
    () => ({
      playing,
      preset: getPreset(stored.preset),
      volume: stored.volume,
      supported,
      toggle,
      play,
      stop,
      select,
      setVolume,
    }),
    [playing, stored.preset, stored.volume, supported, toggle, play, stop, select, setVolume],
  );

  return <SleepContext.Provider value={value}>{children}</SleepContext.Provider>;
}

export function useSleep() {
  const value = useContext(SleepContext);
  if (!value) throw new Error("useSleep must be used inside SleepProvider");
  return value;
}
