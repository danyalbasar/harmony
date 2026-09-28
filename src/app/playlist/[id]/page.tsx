"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { useToast } from "@/context/toast-context";
import { TrackRow } from "@/components/track-row";
import { PlayIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatTime } from "@/lib/tracks";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  return <Playlist id={use(params).id} />;
}

function Playlist({ id }: { id: string }) {
  const { playlists, libraryLoading, removePlaylist, createPlaylist } = useMusic();
  const { play, isPlaying, current, addToQueue } = usePlayer();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const playlist = playlists.find((item) => item.id === id);

  if (!playlist) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        {libraryLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Playlist not found</h1>
            <p className="text-sm text-muted">It may have been deleted.</p>
            <Link
              href="/library"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black transition hover:bg-accent-hover"
            >
              Back to your library
            </Link>
          </>
        )}
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const playingThis = current?.id === playlist.tracks[0]?.id && isPlaying;

  const handleDelete = async () => {
    if (!window.confirm(`Delete the playlist "${playlist.name}"? The songs stay in your library.`)) {
      return;
    }

    try {
      await removePlaylist(playlist.id);
      toast(`Deleted ${playlist.name}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not delete that playlist", "error");
    }
  };

  const handleCreateAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;

    try {
      await createPlaylist(name);
      toast(`Created ${name}. Use the ⋯ menu on a song to add it.`);
      setNewName("");
      setAdding(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not create that playlist", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-card-hover to-card text-3xl font-bold text-dim shadow-lg shadow-black/40">
            {playlist.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Playlist</p>
            <h1 className="mt-2 break-words text-4xl font-bold tracking-tight sm:text-5xl">
              {playlist.name}
            </h1>
            {playlist.description ? (
              <p className="mt-3 max-w-xl text-sm text-muted">{playlist.description}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted">
              {playlist.tracks.length} {playlist.tracks.length === 1 ? "song" : "songs"} ·{" "}
              {formatTime(totalDuration)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => play(playlist.tracks, 0)}
            disabled={playlist.tracks.length === 0}
            className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-black transition hover:bg-accent-hover disabled:opacity-40"
          >
            <PlayIcon className="h-4 w-4 translate-x-[1px]" />
            {playingThis ? "Playing" : "Play"}
          </button>

          <button
            type="button"
            onClick={() => {
              playlist.tracks.forEach(addToQueue);
              toast(`Queued ${playlist.tracks.length} songs`);
            }}
            disabled={playlist.tracks.length === 0}
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-text disabled:opacity-40"
          >
            Add to queue
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full p-3 text-muted transition hover:bg-card hover:text-red-400"
            aria-label="Delete playlist"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {playlist.tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line px-6 py-16 text-center">
          <h2 className="text-lg font-bold">This playlist is empty</h2>
          <p className="max-w-md text-sm text-muted">
            Add songs from your library with the ⋯ menu next to any track.
          </p>

          {adding ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateAndAdd();
              }}
              className="flex w-full max-w-xs gap-2"
            >
              <input
                autoFocus
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Playlist name"
                className="flex-1 rounded-full border border-line bg-card px-4 py-2.5 text-sm text-text placeholder:text-dim focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black transition hover:bg-accent-hover"
              >
                Create
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-text"
            >
              <PlusIcon className="h-4 w-4" />
              New playlist
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-elevated/60 p-2">
          <div className="grid grid-cols-[16px_minmax(0,4fr)_minmax(0,3fr)_auto] gap-4 border-b border-line/70 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-dim md:grid-cols-[16px_minmax(0,6fr)_minmax(0,4fr)_minmax(0,3fr)_auto]">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <span className="hidden md:block">Time</span>
            <span />
          </div>
          {playlist.tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} playlistId={playlist.id} />
          ))}
        </div>
      )}
    </div>
  );
}
