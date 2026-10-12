"use client";

import { useModal } from "@/components/use-modal";
import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { CloseIcon, EqualizerIcon } from "@/components/icons";
import { formatTime } from "@/lib/tracks";

export function QueuePanel() {
  const { queue, current, isPlaying, queueOpen, nowPlayingOpen, setQueueOpen, removeFromQueue, clearUpcoming, playQueued, prepare } =
    usePlayer();

  const dialogRef = useModal<HTMLElement>(queueOpen, () => setQueueOpen(false));
  if (!queueOpen) return null;

  const upcoming = queue;

  return (
    <>
      {queueOpen ? (
        <button
          type="button"
          aria-label="Close queue"
          onClick={() => setQueueOpen(false)}
          className="fixed inset-0 z-[85] bg-black/60"
        />
      ) : null}

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Queue"
        tabIndex={-1}
        className={`safe-inline fixed right-0 top-0 z-[90] flex flex-col border-l border-line bg-elevated pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] ${nowPlayingOpen ? "h-dvh w-[min(384px,92vw)]" : "h-dvh w-full lg:bottom-[var(--player-height)] lg:h-auto lg:max-w-sm"}`}
      >
        <header className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[16px] font-semibold text-text">Queue</h2>
          <button
            type="button"
            onClick={() => setQueueOpen(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-text"
            aria-label="Close queue"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        {current ? (
          <section className="border-b border-line px-4 pb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-dim">
              Now playing
            </p>
            <div className="flex items-center gap-3">
              <CoverArt src={current.coverUrl} title={current.title} className="h-10 w-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-accent-soft">{current.title}</p>
                <p className="truncate text-xs text-muted">{current.artist}</p>
              </div>
              {isPlaying ? <EqualizerIcon className="text-accent-soft" /> : null}
            </div>
          </section>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-dim">
              Up next{upcoming.length > 0 ? ` · ${upcoming.length}` : ""}
            </p>
            {upcoming.length > 0 ? (
              <button
                type="button"
                onClick={clearUpcoming}
                className="min-h-11 px-3 text-sm text-muted underline-offset-4 transition hover:text-text hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>

          {upcoming.length === 0 ? (
            <p className="px-4 text-sm text-dim">
              Your queue is empty. Add songs using “Add to queue” or “Play next” in a song’s menu.
            </p>
          ) : (
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-4">
              {upcoming.map((track, index) => {

                return (
                  <li
                    key={`${track.id}-${index}`}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => playQueued(index)}
                      className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
                      onPointerEnter={() => prepare(track)}
                      onFocus={() => prepare(track)}
                    >
                      <CoverArt
                        src={track.coverUrl}
                        title={track.title}
                        className="h-9 w-9 shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-text">{track.title}</span>
                        <span className="block truncate text-xs text-muted">{track.artist}</span>
                      </span>
                    </button>

                    <span className="text-xs tabular-nums text-dim">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromQueue(index)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-text"
                      aria-label={`Remove ${track.title} from the queue`}
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </aside>
    </>
  );
}
