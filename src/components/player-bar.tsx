"use client";

import Link from "next/link";
import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import {
  LibraryIcon,
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
  VolumeLowIcon,
} from "@/components/icons";
import { formatTime } from "@/lib/tracks";

export function PlayerBar() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    queueOpen,
    setQueueOpen,
    nowPlayingOpen,
    setNowPlayingOpen,
  } = usePlayer();

  const total = duration || current?.duration || 0;
  const progress = total > 0 ? Math.min(currentTime / total, 1) : 0;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[#0b0913]/95 backdrop-blur">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-3 md:grid-cols-3 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => current && setNowPlayingOpen(!nowPlayingOpen)}
            disabled={!current}
            aria-label={current ? (nowPlayingOpen ? "Hide now playing" : "Open now playing") : "Nothing playing"}
            aria-expanded={nowPlayingOpen}
            title={current ? (nowPlayingOpen ? "Hide now playing" : "Open now playing") : undefined}
            className="shrink-0 transition disabled:cursor-default enabled:hover:opacity-80 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-accent"
          >
            <CoverArt
              src={current?.coverUrl ?? null}
              title={current?.title ?? "Nothing playing"}
              className="h-12 w-12"
            />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {current ? current.title : "Nothing playing"}
            </p>
            <p className="truncate text-xs text-muted">
              {current ? current.artist : "Pick a song from your library"}
            </p>
          </div>

          {current ? (
            <Link
              href="/library"
              className="hidden shrink-0 rounded-full p-2 text-muted transition hover:text-text sm:block"
              aria-label="Open your library"
            >
              <LibraryIcon className={`h-4 w-4 ${isPlaying ? "" : "text-dim opacity-50"}`} />
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <ToggleButton
              label="Shuffle"
              active={shuffle}
              onClick={toggleShuffle}
              disabled={!current}
            >
              <ShuffleIcon className="h-4 w-4" />
            </ToggleButton>

            <button
              type="button"
              onClick={previous}
              disabled={!current}
              className="rounded-full p-1.5 text-muted transition hover:text-text disabled:opacity-40"
              aria-label="Previous"
            >
              <PreviousIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggle}
              disabled={!current}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-text text-black transition hover:scale-105 disabled:opacity-40"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4 translate-x-[1px]" />
              )}
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!current}
              className="rounded-full p-1.5 text-muted transition hover:text-text disabled:opacity-40"
              aria-label="Next"
            >
              <NextIcon className="h-4 w-4" />
            </button>

            <ToggleButton
              label={repeat === "one" ? "Repeat one" : repeat === "all" ? "Repeat all" : "Repeat off"}
              active={repeat !== "off"}
              onClick={cycleRepeat}
              disabled={!current}
            >
              {repeat === "one" ? (
                <RepeatOneIcon className="h-4 w-4" />
              ) : (
                <RepeatIcon className="h-4 w-4" />
              )}
            </ToggleButton>
          </div>

          <div className="hidden w-full max-w-[560px] items-center gap-2 md:flex">
            <span className="w-10 text-right text-[11px] tabular-nums text-muted">
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

            <span className="w-10 text-[11px] tabular-nums text-muted">{formatTime(total)}</span>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={() => setQueueOpen(!queueOpen)}
            className={`rounded-full p-2 transition hover:text-text ${
              queueOpen ? "text-accent-soft" : "text-muted"
            }`}
            aria-label="Queue"
            aria-pressed={queueOpen}
          >
            <QueueIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="rounded-full p-2 text-muted transition hover:text-text"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <MutedIcon className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <VolumeLowIcon className="h-4 w-4" />
            ) : (
              <VolumeIcon className="h-4 w-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
            className="h-1 w-24"
            style={
              {
                "--range-track": `linear-gradient(to right, #a99fc4 ${
                  (muted ? 0 : volume) * 100
                }%, #3a3159 ${(muted ? 0 : volume) * 100}%)`,
              } as React.CSSProperties
            }
          />
        </div>
      </div>
    </footer>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
  disabled,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`relative rounded-full p-1.5 transition disabled:opacity-40 ${
        active ? "text-accent-soft after:absolute after:-bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-accent-soft" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
