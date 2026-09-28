"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import {
  CloseIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
} from "@/components/icons";
import { formatTime } from "@/lib/tracks";

/**
 * The big cover view. It only ever opens because someone asked for it, by
 * clicking a song, its artwork or its title, or the cover in the player bar.
 * Pressing play on its own deliberately leaves it closed, so starting a song
 * never throws the page out from under you.
 */
export function NowPlayingOverlay() {
  const { current, nowPlayingOpen, setNowPlayingOpen } = usePlayer();
  const startY = useRef<number | null>(null);

  // Escape closes it, and the page behind it must not scroll while it is up.
  useEffect(() => {
    if (!nowPlayingOpen || !current) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNowPlayingOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [current, nowPlayingOpen, setNowPlayingOpen]);

  if (!current || !nowPlayingOpen) return null;

  // Drag downwards to dismiss, the way the phone app does.
  const onTouchStart = (event: React.TouchEvent) => {
    startY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const from = startY.current;
    const to = event.changedTouches[0]?.clientY ?? null;
    startY.current = null;

    if (from === null || to === null) return;
    if (to - from > 90) setNowPlayingOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing ${current.title}`}
      className="fixed inset-0 z-60 flex flex-col bg-[#08070d]"
    >
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex shrink-0 items-center justify-between px-4 pb-2 pt-5"
      >
        <span className="w-1/3" />
        <div className="flex w-1/3 justify-center" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-dim" />
        </div>
        <div className="flex w-1/3 justify-end">
          <button
            type="button"
            onClick={() => setNowPlayingOpen(false)}
            className="rounded-full p-1.5 text-muted transition hover:text-text"
            aria-label="Close now playing"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-7 overflow-y-auto px-6 pb-10">
        <CoverArt
          src={current.coverUrl}
          title={current.title}
          rounded="rounded-xl shadow-2xl shadow-black/70"
          className="mx-auto aspect-square w-full max-w-[420px] sm:max-w-[480px]"
        />

        <div className="min-w-0 text-center">
          <h2 className="truncate text-2xl font-bold tracking-tight">{current.title}</h2>
          <p className="mt-0.5 truncate text-sm text-muted">{current.artist}</p>
          {current.album ? (
            <p className="mt-0.5 truncate text-xs text-dim">{current.album}</p>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-[520px]">
          <SeekRow />
          <div className="mt-4">
            <Transport />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[520px] text-center">
          <Link
            href="/library"
            onClick={() => setNowPlayingOpen(false)}
            className="text-xs text-muted underline-offset-4 transition hover:text-text hover:underline"
          >
            Go to your library
          </Link>
        </div>
      </div>
    </div>
  );
}
function SeekRow() {
  const { current, currentTime, duration, seek } = usePlayer();

  const total = duration || current?.duration || 0;
  const progress = total > 0 ? Math.min(currentTime / total, 1) : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-right text-[11px] tabular-nums text-muted">
        {formatTime(currentTime)}
      </span>

      <input
        type="range"
        min={0}
        max={total || 0}
        step={0.1}
        value={Math.min(currentTime, total || 0)}
        onChange={(event) => seek(Number(event.target.value))}
        disabled={!current || total === 0}
        aria-label="Seek"
        className="h-1 flex-1 disabled:opacity-50"
        style={
          {
            "--range-track": `linear-gradient(to right, #8b5cf6 ${progress * 100}%, #3a3159 ${
              progress * 100
            }%)`,
          } as React.CSSProperties
        }
      />

      <span className="w-9 text-[11px] tabular-nums text-muted">{formatTime(total)}</span>
    </div>
  );
}

function Transport() {
  const {
    current,
    isPlaying,
    shuffle,
    repeat,
    toggle,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  const repeatLabel = repeat === "one" ? "Repeat one" : repeat === "all" ? "Repeat all" : "Repeat off";
  const shuffleOn = shuffle;

  return (
    <div className="flex items-center justify-center gap-5">
      <button
        type="button"
        onClick={toggleShuffle}
        disabled={!current}
        title="Shuffle"
        aria-label="Shuffle"
        aria-pressed={shuffleOn}
        className={`relative rounded-full p-1.5 transition disabled:opacity-40 ${
          shuffleOn ? "text-accent-soft" : "text-muted hover:text-text"
        }`}
      >
        <ShuffleIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={previous}
        disabled={!current}
        aria-label="Previous"
        className="rounded-full p-1.5 text-muted transition hover:text-text disabled:opacity-40"
      >
        <PreviousIcon className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={toggle}
        disabled={!current}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-text text-black transition hover:scale-105 disabled:opacity-40"
      >
        {isPlaying ? (
          <PauseIcon className="h-6 w-6" />
        ) : (
          <PlayIcon className="h-6 w-6 translate-x-[1px]" />
        )}
      </button>

      <button
        type="button"
        onClick={next}
        disabled={!current}
        aria-label="Next"
        className="rounded-full p-1.5 text-muted transition hover:text-text disabled:opacity-40"
      >
        <NextIcon className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={cycleRepeat}
        disabled={!current}
        title={repeatLabel}
        aria-label={repeatLabel}
        aria-pressed={repeat !== "off"}
        className={`relative rounded-full p-1.5 transition disabled:opacity-40 ${
          repeat !== "off" ? "text-accent-soft" : "text-muted hover:text-text"
        }`}
      >
        {repeat === "one" ? <RepeatOneIcon className="h-5 w-5" /> : <RepeatIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
