"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/player-context";
import { useModal } from "@/components/use-modal";
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
  MutedIcon,
  QueueIcon,
  VolumeIcon,
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

  const dialogRef = useModal(Boolean(nowPlayingOpen && current), () => setNowPlayingOpen(false));

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
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing ${current.title}`}
      className="safe-inline fixed inset-0 z-[70] flex h-dvh flex-col bg-[#08070d] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    >
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex shrink-0 items-center justify-between px-1 pb-2 pt-2 sm:px-4"
      >
        <span className="w-1/3" />
        <div className="flex w-1/3 justify-center" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-dim" />
        </div>
        <div className="flex w-1/3 justify-end">
          <button
            type="button"
            onClick={() => setNowPlayingOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-text"
            aria-label="Close now playing"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-1 pb-6 pt-2 sm:gap-7 sm:px-6 sm:py-6">
        <CoverArt
          src={current.coverUrl}
          title={current.title}
          rounded="rounded-xl shadow-2xl shadow-black/70"
          className="mx-auto aspect-square w-[min(100%,42dvh)] max-w-[420px] shrink-0 sm:max-w-[480px]"
        />

        <div className="min-w-0 text-center">
          <h2 className="break-words text-xl font-bold sm:text-2xl tracking-tight">{current.title}</h2>
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
          <PlayerOptions />
        </div>

        <div className="mx-auto w-full max-w-[520px] text-center">
          <Link
            href="/library"
            onClick={() => setNowPlayingOpen(false)}
            className="inline-flex min-h-11 items-center px-3 text-sm text-muted underline-offset-4 transition hover:text-text hover:underline"
          >
            Go to your library
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlayerOptions() {
  const { volume, muted, setVolume, toggleMute, setQueueOpen, setNowPlayingOpen } = usePlayer();
  return (
    <div className="mt-5 flex items-center gap-3">
      <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted">
        {muted || volume === 0 ? <MutedIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
      </button>
      <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" className="min-w-0 flex-1"
        style={{ "--range-track": `linear-gradient(to right, #a99fc4 ${(muted ? 0 : volume) * 100}%, #3a3159 ${(muted ? 0 : volume) * 100}%)` } as React.CSSProperties} />
      <button type="button" onClick={() => { setNowPlayingOpen(false); setQueueOpen(true); }} aria-label="Queue" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted"><QueueIcon className="h-5 w-5" /></button>
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
        className="min-w-0 flex-1 disabled:opacity-50"
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
    <div className="flex items-center justify-center gap-2 sm:gap-5">
      <button
        type="button"
        onClick={toggleShuffle}
        disabled={!current}
        title="Shuffle"
        aria-label="Shuffle"
        aria-pressed={shuffleOn}
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
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
        className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-text disabled:opacity-40"
      >
        <PreviousIcon className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={toggle}
        disabled={!current}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-text text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-40"
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
        className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-text disabled:opacity-40"
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
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
          repeat !== "off" ? "text-accent-soft" : "text-muted hover:text-text"
        }`}
      >
        {repeat === "one" ? <RepeatOneIcon className="h-5 w-5" /> : <RepeatIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
