"use client";

import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { MutedIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, QueueIcon, RepeatIcon, RepeatOneIcon, ShuffleIcon, VolumeIcon, VolumeLowIcon } from "@/components/icons";
import { formatTime } from "@/lib/tracks";

export function PlayerBar() {
  const { current, isPlaying, volume, muted, shuffle, repeat, toggle, next, previous, setVolume, toggleMute, toggleShuffle, cycleRepeat, queueOpen, setQueueOpen, nowPlayingOpen, setNowPlayingOpen } = usePlayer();
  const repeatLabel = repeat === "one" ? "Repeat one" : repeat === "all" ? "Repeat all" : "Repeat off";

  return (
    <footer aria-label="Music player" className="fixed inset-x-0 bottom-0 z-50 h-[var(--player-height)] border-t border-line bg-[#0b0913]/95 backdrop-blur">
      <div className="safe-inline grid h-full grid-cols-[minmax(0,1fr)_auto] grid-rows-[64px_40px] items-center gap-x-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1.5fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-x-4">
        <button type="button" onClick={() => current && setNowPlayingOpen(!nowPlayingOpen)} disabled={!current}
          aria-label={current ? (nowPlayingOpen ? "Hide now playing" : "Open now playing") : "Nothing playing"} aria-expanded={nowPlayingOpen}
          className="flex min-h-12 min-w-0 items-center gap-2 rounded-md text-left transition-colors enabled:hover:bg-card disabled:cursor-default lg:gap-3">
          <CoverArt src={current?.coverUrl ?? null} title={current?.title ?? "Nothing playing"} className="h-11 w-11 shrink-0 lg:h-12 lg:w-12" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium sm:text-sm">{current?.title ?? "Nothing playing"}</span>
            <span className="block truncate text-[11px] text-muted sm:text-xs">{current?.artist ?? "Choose a song"}</span>
          </span>
        </button>

        <div className="flex min-w-0 flex-col items-center lg:gap-1">
          <div className="flex items-center gap-0 lg:gap-1">
            <span className="hidden lg:block"><ToggleButton label="Shuffle" active={shuffle} onClick={toggleShuffle} disabled={!current}><ShuffleIcon className="h-4 w-4" /></ToggleButton></span>
            <button type="button" onClick={previous} disabled={!current} aria-label="Previous" className="hidden h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-text disabled:opacity-40 lg:flex"><PreviousIcon className="h-4 w-4" /></button>
            <button type="button" onClick={toggle} disabled={!current} aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-text text-black transition-colors hover:bg-white disabled:opacity-40">
              {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button type="button" onClick={next} disabled={!current} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-text disabled:opacity-40"><NextIcon className="h-5 w-5 lg:h-4 lg:w-4" /></button>
            <span className="hidden lg:block"><ToggleButton label={repeatLabel} active={repeat !== "off"} onClick={cycleRepeat} disabled={!current}>{repeat === "one" ? <RepeatOneIcon className="h-4 w-4" /> : <RepeatIcon className="h-4 w-4" />}</ToggleButton></span>
            <button type="button" onClick={() => setQueueOpen(!queueOpen)} aria-label="Queue" aria-expanded={queueOpen} className={`flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${queueOpen ? "text-accent-soft" : "text-muted"}`}><QueueIcon className="h-5 w-5" /></button>
          </div>
          <div className="hidden w-full lg:block"><PlayerProgress /></div>
        </div>

        <div className="col-span-2 w-full lg:hidden"><PlayerProgress /></div>

        <div className="hidden min-w-0 items-center justify-end lg:flex">
          <button type="button" onClick={() => setQueueOpen(!queueOpen)} aria-label="Queue" aria-expanded={queueOpen} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${queueOpen ? "text-accent-soft" : "text-muted hover:text-text"}`}><QueueIcon className="h-4 w-4" /></button>
          <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-text">
            {muted || volume === 0 ? <MutedIcon className="h-4 w-4" /> : volume < 0.5 ? <VolumeLowIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" className="w-full max-w-24" style={{ "--range-track": `linear-gradient(to right, #a99fc4 ${(muted ? 0 : volume) * 100}%, #3a3159 ${(muted ? 0 : volume) * 100}%)` } as React.CSSProperties} />
        </div>
      </div>
    </footer>
  );
}

function PlayerProgress() {
  const { current, currentTime, duration, seek } = usePlayer();
  const total = duration || current?.duration || 0;
  const progress = total > 0 ? Math.min(currentTime / total, 1) : 0;
  return (
    <div className="flex w-full items-center gap-2">
      <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-muted">{formatTime(currentTime)}</span>
      <input type="range" min={0} max={total || 0} step={0.1} value={Math.min(currentTime, total || 0)} onChange={(event) => seek(Number(event.target.value))} disabled={!current || total === 0} aria-label="Seek" className="min-w-0 flex-1 disabled:opacity-50" style={{ "--range-track": `linear-gradient(to right, #8b5cf6 ${progress * 100}%, #3a3159 ${progress * 100}%)` } as React.CSSProperties} />
      <span className="w-8 shrink-0 text-[11px] tabular-nums text-muted">{formatTime(total)}</span>
    </div>
  );
}

function ToggleButton({ label, active, onClick, disabled, children }: { label: string; active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} aria-pressed={active}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${active ? "text-accent-soft after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-accent-soft" : "text-muted hover:text-text"}`}>
      {children}
    </button>
  );
}
