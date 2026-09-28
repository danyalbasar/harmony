"use client";

import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { CloseIcon, EqualizerIcon } from "@/components/icons";
import { formatTime } from "@/lib/tracks";

export function QueuePanel() {
  const { queue, queueIndex, current, isPlaying, queueOpen, setQueueOpen, removeFromQueue, clearUpcoming, play } =
    usePlayer();

  const upcoming = queue.slice(queueIndex + 1);

  return (
    <>
      {queueOpen ? (
        <button
          type="button"
          aria-label="Close queue"
          onClick={() => setQueueOpen(false)}
          className="fixed inset-0 z-40 hidden bg-black/50 md:block"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-[calc(100%-96px)] w-full max-w-sm flex-col border-l border-line bg-elevated transition-transform duration-200 md:h-[calc(100%-88px)] ${
          queueOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
        aria-hidden={!queueOpen}
      >
        <header className="flex items-center justify-between px-4 py-3">
          <h2 className="text-base font-semibold">Queue</h2>
          <button
            type="button"
            onClick={() => setQueueOpen(false)}
            className="rounded-full p-1.5 text-muted transition hover:text-text"
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
                className="text-xs text-muted underline-offset-4 transition hover:text-text hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>

          {upcoming.length === 0 ? (
            <p className="px-4 text-sm text-dim">
              Nothing queued. Hit play on a song or add one from the ⋯ menu.
            </p>
          ) : (
            <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              {upcoming.map((track, offset) => {
                const index = queueIndex + 1 + offset;

                return (
                  <li
                    key={`${track.id}-${index}`}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => play(queue, index)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                      className="rounded-full p-1.5 text-muted opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 hover:text-text"
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
