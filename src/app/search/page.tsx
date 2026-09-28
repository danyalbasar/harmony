"use client";

import { useMemo, useState } from "react";
import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { TrackRow } from "@/components/track-row";
import { SearchIcon } from "@/components/icons";

export default function SearchPage() {
  return <Search />;
}

function Search() {
  const { tracks, playlists, libraryLoading } = useMusic();
  const { play } = usePlayer();
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const matchingTracks = useMemo(
    () =>
      normalized
        ? tracks.filter((track) =>
            [track.title, track.artist, track.album ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(normalized),
          )
        : tracks,
    [tracks, normalized],
  );

  const matchingPlaylists = useMemo(
    () =>
      normalized
        ? playlists.filter((playlist) =>
            [playlist.name, playlist.description ?? ""].join(" ").toLowerCase().includes(normalized),
          )
        : playlists,
    [playlists, normalized],
  );

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>

        <div className="flex items-center gap-3 rounded-full border border-line bg-elevated px-4 py-3 transition focus-within:border-accent">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-transparent text-sm text-text placeholder:text-dim focus:outline-none"
            aria-label="Search your library"
          />
        </div>
      </header>

      {matchingTracks.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">
              {normalized ? `Songs · ${matchingTracks.length}` : "Songs"}
            </h2>
            {matchingTracks.length > 0 ? (
              <button
                type="button"
                onClick={() => play(matchingTracks, 0)}
                className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-text"
              >
                Play all
              </button>
            ) : null}
          </div>

          <div className="rounded-xl bg-elevated/60 p-2">
            {matchingTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {matchingPlaylists.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-bold tracking-tight">Playlists</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {matchingPlaylists.map((playlist) => (
              <li
                key={playlist.id}
                className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 transition hover:bg-card-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{playlist.name}</p>
                  <p className="truncate text-xs text-muted">
                    {playlist.tracks.length} {playlist.tracks.length === 1 ? "song" : "songs"} ·{" "}
                    {formatDuration(playlist.tracks.map((track) => track.duration))}
                  </p>
                </div>
                {playlist.tracks.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => play(playlist.tracks, 0)}
                    className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-text"
                  >
                    Play
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {libraryLoading ? (
        <p className="text-sm text-muted">Loading your library…</p>
      ) : normalized && matchingTracks.length === 0 && matchingPlaylists.length === 0 ? (
        <p className="text-sm text-muted">No results for “{query}”.</p>
      ) : null}
    </div>
  );
}

function formatDuration(durations: number[]) {
  const total = durations.reduce((sum, value) => sum + value, 0);

  if (total === 0) return "0 min";

  const hours = Math.floor(total / 3600);
  const minutes = Math.round((total % 3600) / 60);

  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${Math.max(minutes, 1)} min`;
}
