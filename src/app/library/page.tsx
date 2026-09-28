"use client";

import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { SignOutButton } from "@/components/sign-out-button";
import { TrackRow } from "@/components/track-row";
import { PlayIcon } from "@/components/icons";
import Link from "next/link";
import { formatTime } from "@/lib/tracks";

export default function LibraryPage() {
  return <Library />;
}

function Library() {
  const { tracks, playlists, libraryLoading } = useMusic();
  const { play, isPlaying, current } = usePlayer();

  const playingWholeLibrary = current?.id === tracks[0]?.id && isPlaying;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
          <p className="mt-1 text-sm text-muted">
            {tracks.length} {tracks.length === 1 ? "song" : "songs"} · {playlists.length}{" "}
            {playlists.length === 1 ? "playlist" : "playlists"}
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => play(tracks, 0)}
          disabled={tracks.length === 0}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black transition hover:bg-accent-hover disabled:opacity-40"
        >
          <PlayIcon className="h-4 w-4 translate-x-[1px]" />
          {playingWholeLibrary ? "Playing" : "Play all"}
        </button>
      </div>

      {libraryLoading ? <p className="text-sm text-muted">Loading…</p> : null}

      {tracks.length > 0 ? (
        <div className="rounded-xl bg-elevated/60 p-2">
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} />
          ))}
        </div>
      ) : !libraryLoading ? (
        <p className="text-sm text-muted">No songs yet.</p>
      ) : null}

      {playlists.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-bold tracking-tight">Playlists</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                className="flex flex-col gap-1 rounded-lg bg-card px-4 py-3 transition hover:bg-card-hover"
              >
                <Link href={`/playlist/${playlist.id}`} className="truncate text-sm font-semibold">
                  {playlist.name}
                </Link>
                <p className="text-xs text-muted">
                  {playlist.tracks.length}{" "}
                  {playlist.tracks.length === 1 ? "song" : "songs"} ·{" "}
                  {formatTime(
                    playlist.tracks.reduce((sum, track) => sum + track.duration, 0),
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
