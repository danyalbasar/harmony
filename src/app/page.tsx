"use client";

import Link from "next/link";
import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { SignOutButton } from "@/components/sign-out-button";
import { TrackCard } from "@/components/track-card";
import { TrackRow } from "@/components/track-row";
import { PlayIcon } from "@/components/icons";
import type { TrackWithUrls } from "@/lib/tracks";

export default function HomePage() {
  return <Home />;
}

function Home() {
  const { tracks, libraryLoading, libraryError, refreshLibrary } = useMusic();

  const recent = tracks.slice(0, 12);
  const liked = tracks.filter((track) => track.album).slice(0, 8);

  return (
    <div className="flex flex-col gap-10 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home</h1>
          <p className="mt-1 text-sm text-muted">
            {tracks.length === 0
              ? "Nothing here yet."
              : `${tracks.length} ${tracks.length === 1 ? "song" : "songs"} in the library`}
          </p>
        </div>
        <SignOutButton />
      </header>

      {libraryError ? (
        <div className="rounded-lg border border-red-500/40 bg-[#2a1416] p-4 text-sm text-red-100">
          {libraryError}{" "}
          <button type="button" onClick={() => void refreshLibrary()} className="underline">
            Retry
          </button>
        </div>
      ) : null}

      <QuickGrid
        items={[
          ...(recent.length > 0
            ? recent.slice(0, 4).map((track) => ({
                key: track.id,
                title: track.title,
                subtitle: track.artist,
                coverUrl: track.coverUrl,
                tracks: [track],
              }))
            : []),
          // Playlists are paused.
          // ...playlists.slice(0, 2).map((playlist) => ({
          //   key: playlist.id,
          //   title: playlist.name,
          //   subtitle: `Playlist · ${playlist.tracks.length} songs`,
          //   coverUrl: playlist.tracks[0]?.coverUrl ?? null,
          //   tracks: playlist.tracks,
          //   href: `/playlist/${playlist.id}`,
          // })),
        ]}
      />

      {libraryLoading && tracks.length === 0 ? <SkeletonGrid /> : null}

      {!libraryLoading && tracks.length === 0 ? <EmptyState /> : null}

      {recent.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight">Recently added</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {recent.map((track) => (
              <TrackCard key={track.id} track={track} tracks={tracks} />
            ))}
          </div>
        </section>
      ) : null}

      {liked.length > 0 && liked.length !== recent.length ? (
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight">By album</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {liked.map((track) => (
              <TrackCard key={track.id} track={track} tracks={tracks} />
            ))}
          </div>
        </section>
      ) : null}

      {tracks.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight">All songs</h2>
          <div className="rounded-xl bg-elevated/60 p-2">
            <div className="grid grid-cols-[16px_minmax(0,4fr)_minmax(0,3fr)_auto] gap-4 border-b border-line/70 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-dim md:grid-cols-[16px_minmax(0,6fr)_minmax(0,4fr)_minmax(0,3fr)_auto]">
              <span className="text-center">#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="hidden md:block">Time</span>
              <span />
            </div>
            {tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

type QuickItem = {
  key: string;
  title: string;
  subtitle: string;
  coverUrl: string | null;
  tracks: TrackWithUrls[];
  href?: string;
};

function QuickGrid({ items }: { items: QuickItem[] }) {
  const { play } = usePlayer();

  if (items.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const cover = item.coverUrl;

        return (
          <div
            key={item.key}
            className="group relative flex items-center gap-4 overflow-hidden rounded-lg bg-card transition hover:bg-card-hover"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-[#1b1730]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold uppercase text-dim">
                  {item.title.slice(0, 2)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 pr-12">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-muted">{item.subtitle}</p>
            </div>

            {item.href ? (
              <Link
                href={item.href}
                className="absolute inset-0"
                aria-label={`Open ${item.title}`}
              />
            ) : (
              <button
                type="button"
                onClick={() => play(item.tracks, 0)}
                className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-lg transition group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Play ${item.title}`}
              >
                <PlayIcon className="h-4 w-4 translate-x-[1px]" />
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg bg-card p-3">
          <div className="aspect-square w-full rounded bg-[#221c36]" />
          <div className="mt-4 h-3 w-3/4 rounded bg-[#221c36]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#221c36]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line px-6 py-16 text-center">
      <h2 className="text-xl font-bold">The library is empty</h2>
      <p className="max-w-md text-sm text-muted">
        No songs have been added yet. Once the owner uploads one it will show up here, ready to
        play.
      </p>
    </div>
  );
}
