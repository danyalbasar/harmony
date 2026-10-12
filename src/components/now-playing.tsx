"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/player-context";
import { useModal } from "@/components/use-modal";
import { CoverArt } from "@/components/cover-art";
import {
  ChevronDownIcon,
  LibraryIcon,
  MoreIcon,
  MutedIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  QueueIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
  VolumeIcon,
} from "@/components/icons";
import { formatTime } from "@/lib/tracks";

export function NowPlayingOverlay() {
  const { current, nowPlayingOpen, setNowPlayingOpen } = usePlayer();
  const startY = useRef<number | null>(null);
  const dialogRef = useModal(Boolean(nowPlayingOpen && current), () => setNowPlayingOpen(false));

  if (!current || !nowPlayingOpen) return null;

  const onTouchStart = (event: React.TouchEvent) => {
    startY.current = event.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const from = startY.current;
    const to = event.changedTouches[0]?.clientY ?? null;
    startY.current = null;
    if (from !== null && to !== null && to - from > 90) setNowPlayingOpen(false);
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing ${current.title}`}
      className="full-player fixed inset-0 z-[70] flex h-dvh flex-col overflow-hidden text-white"
    >
      <div aria-hidden="true" className="full-player-background pointer-events-none absolute inset-0 overflow-hidden">
        {current.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.coverUrl} alt="" decoding="async" className="h-full w-full scale-110 object-cover opacity-40 blur-[64px]" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />
      </div>

      <header
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="full-player-header relative z-20 flex shrink-0 items-center justify-between gap-3"
      >
        <button
          type="button"
          onClick={() => setNowPlayingOpen(false)}
          aria-label="Close now playing"
          className="full-player-icon"
        >
          <ChevronDownIcon className="h-6 w-6" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Playing from your library</p>
          <p className="mt-1 truncate text-xs font-semibold">{current.album || "Your Library"}</p>
        </div>
        <PlayerMenu />
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="full-player-content">
          <div className="full-player-artwork">
            <CoverArt
              src={current.coverUrl}
              title={current.title}
              rounded="rounded-md shadow-2xl shadow-black/50"
              className="full-player-cover aspect-square"
            />
          </div>

          <div className="full-player-controls min-w-0">
            <div className="min-w-0">
              <h2 className="break-words text-[26px] font-bold leading-tight tracking-tight sm:text-[32px]">{current.title}</h2>
              <p className="mt-2 break-words text-[15px] text-white/65 sm:text-[17px]">{current.artist}</p>
            </div>
            <SeekRow />
            <Transport />
            <PlayerOptions />
          </div>
        </div>
      </div>
    </div>
  );
}

function useDismissablePanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Handle this before the full player's document-level Escape listener.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      ref.current?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onEscape, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onEscape, true);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function PlayerMenu() {
  const { setQueueOpen, setNowPlayingOpen } = usePlayer();
  const { open, setOpen, ref } = useDismissablePanel();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Player options"
        aria-expanded={open}
        className="full-player-icon"
      >
        <MoreIcon className="h-6 w-6" />
      </button>
      {open ? (
        <div role="group" aria-label="Player options" className="absolute right-0 top-12 w-52 rounded-xl border border-white/10 bg-[#24202b] p-1 shadow-2xl">
          <button
            type="button"
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm hover:bg-white/10"
            onClick={() => { setNowPlayingOpen(false); setQueueOpen(true); }}
          >
            <QueueIcon className="h-5 w-5" />Open queue
          </button>
          <Link href="/library" onClick={() => setNowPlayingOpen(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm hover:bg-white/10">
            <LibraryIcon className="h-5 w-5" />Your Library
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function PlayerOptions() {
  const { volume, muted, setVolume, toggleMute, setQueueOpen, setNowPlayingOpen } = usePlayer();
  const { open, setOpen, ref } = useDismissablePanel();
  const displayedVolume = muted ? 0 : volume;
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Volume controls"
          aria-expanded={open}
          className="full-player-icon text-white/70"
        >
          {muted || volume === 0 ? <MutedIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
        </button>
        {open ? (
          <div role="group" aria-label="Volume controls" className="absolute bottom-14 left-0 w-[min(288px,calc(100vw-64px))] rounded-xl border border-white/10 bg-[#24202b] p-3 shadow-2xl">
            <p className="mb-1 text-xs font-semibold text-white/70">Volume</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="full-player-icon">
                {muted || volume === 0 ? <MutedIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.01} value={displayedVolume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume" className="min-w-0 flex-1"
                style={{ "--range-track": `linear-gradient(to right, #fff ${displayedVolume * 100}%, #ffffff30 ${displayedVolume * 100}%)` } as React.CSSProperties}
              />
            </div>
          </div>
        ) : null}
      </div>
      <Link href="/library" onClick={() => setNowPlayingOpen(false)} className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-medium text-white/60 transition-colors hover:text-white">
        <LibraryIcon className="h-4 w-4" />Library
      </Link>
      <button
        type="button"
        onClick={() => { setNowPlayingOpen(false); setQueueOpen(true); }}
        aria-label="Queue"
        className="full-player-icon text-white/70"
      >
        <QueueIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

function SeekRow() {
  const { current, currentTime, duration, seek } = usePlayer();
  const total = duration || current?.duration || 0;
  const progress = total > 0 ? Math.min(currentTime / total, 1) : 0;
  return (
    <div className="mt-5">
      <input
        type="range" min={0} max={total || 0} step={0.1}
        value={Math.min(currentTime, total || 0)}
        onChange={(event) => seek(Number(event.target.value))}
        disabled={!current || total === 0}
        aria-label="Seek" className="block w-full disabled:opacity-50"
        style={{ "--range-track": `linear-gradient(to right, #fff ${progress * 100}%, #ffffff30 ${progress * 100}%)` } as React.CSSProperties}
      />
      <div className="-mt-1 flex items-center justify-between text-[11px] tabular-nums text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(total)}</span>
      </div>
    </div>
  );
}

function Transport() {
  const { current, isPlaying, shuffle, repeat, toggle, next, previous, toggleShuffle, cycleRepeat } = usePlayer();
  const repeatLabel = repeat === "one" ? "Repeat one" : repeat === "all" ? "Repeat all" : "Repeat off";
  return (
    <div className="mt-5 flex items-center justify-between gap-1">
      <button
        type="button" onClick={toggleShuffle} disabled={!current}
        aria-label="Shuffle" aria-pressed={shuffle}
        className={`full-player-icon relative ${shuffle ? "text-accent-soft after:absolute after:bottom-0 after:h-1 after:w-1 after:rounded-full after:bg-accent-soft" : "text-white/70"}`}
      >
        <ShuffleIcon className="h-6 w-6" />
      </button>
      <button type="button" onClick={previous} disabled={!current} aria-label="Previous" className="full-player-icon">
        <PreviousIcon className="h-7 w-7" />
      </button>
      <button
        type="button" onClick={toggle} disabled={!current}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-white text-[#101010] transition-colors hover:bg-white/90 disabled:opacity-40"
      >
        {isPlaying ? <PauseIcon className="h-7 w-7" /> : <PlayIcon className="h-7 w-7 translate-x-[1px]" />}
      </button>
      <button type="button" onClick={next} disabled={!current} aria-label="Next" className="full-player-icon">
        <NextIcon className="h-7 w-7" />
      </button>
      <button
        type="button" onClick={cycleRepeat} disabled={!current}
        aria-label={repeatLabel} aria-pressed={repeat !== "off"}
        className={`full-player-icon relative ${repeat !== "off" ? "text-accent-soft after:absolute after:bottom-0 after:h-1 after:w-1 after:rounded-full after:bg-accent-soft" : "text-white/70"}`}
      >
        {repeat === "one" ? <RepeatOneIcon className="h-6 w-6" /> : <RepeatIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
