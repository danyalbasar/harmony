"use client";

import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { PauseIcon, PlayIcon } from "@/components/icons";
import type { TrackWithUrls } from "@/lib/tracks";

type TrackCardProps = {
  track: TrackWithUrls;
  tracks: TrackWithUrls[];
};

export function TrackCard({ track, tracks }: TrackCardProps) {
  const { current, isPlaying, play, prepare, toggle, setNowPlayingOpen } = usePlayer();
  const isCurrent = current?.id === track.id;

  // The card opens the big cover view, its play button just starts the song.
  const openCover = () => {
    if (!isCurrent) {
      play(tracks, tracks.findIndex((t) => t.id === track.id));
    }

    setNowPlayingOpen(true);
  };

  return (
    <div
      onPointerEnter={() => prepare(track)}
      onFocus={() => prepare(track)}
      onTouchStart={() => prepare(track)}
      className="group relative rounded-lg bg-card p-3 transition hover:bg-card-hover"
    >
      <div className="relative">
        <button
          type="button"
          onClick={openCover}
          className="block w-full rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`Show ${track.title}`}
        >
          <CoverArt
            src={track.coverUrl}
            title={track.title}
            className="aspect-square w-full"
            rounded="rounded"
          />
        </button>

        <button
          type="button"
          onClick={() => {
            if (isCurrent) {
              toggle();
              return;
            }

            play(tracks, tracks.findIndex((t) => t.id === track.id));
          }}
          className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {isCurrent && isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5 translate-x-[1px]" />
          )}
        </button>
      </div>

      <p className={`mt-4 truncate text-sm font-semibold ${isCurrent ? "text-accent-soft" : "text-text"}`}>
        {track.title}
      </p>
      <p className="truncate text-xs text-muted">
        {track.artist}
        {track.album ? ` · ${track.album}` : ""}
      </p>
    </div>
  );
}
