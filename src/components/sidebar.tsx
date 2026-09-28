"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { useToast } from "@/context/toast-context";
import {
  EqualizerIcon,
  HomeIcon,
  LibraryIcon,
  MusicIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";

export function Sidebar() {
  const pathname = usePathname();
  const { user, playlists, createPlaylist } = useMusic();
  const { play } = usePlayer();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setCreating(false);
      return;
    }

    try {
      await createPlaylist(trimmed);
      setName("");
      setCreating(false);
      toast(`Created ${trimmed}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not create that playlist", "error");
    }
  };

  return (
    <nav className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-2 border-r border-line bg-elevated p-3 md:flex">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-xl font-bold tracking-tight"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">
          <MusicIcon className="h-4 w-4" />
        </span>
        Harmony
      </Link>

      <ul className="mt-2 flex flex-col gap-1">
        <NavItem href="/" icon={<HomeIcon className="h-5 w-5" />} label="Home" active={pathname === "/"} />
        <NavItem
          href="/search"
          icon={<SearchIcon className="h-5 w-5" />}
          label="Search"
          active={pathname === "/search"}
        />
        <NavItem
          href="/library"
          icon={<LibraryIcon className="h-5 w-5" />}
          label="Your Library"
          active={pathname === "/library"}
        />
      </ul>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Playlists
          </span>
          {user ? (
            <button
              type="button"
              onClick={() => setCreating((value) => !value)}
              className="rounded-full p-1 text-muted transition hover:bg-card-hover hover:text-text"
              aria-label="Create a playlist"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {creating ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreate();
            }}
            className="mb-2 px-1"
          >
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => {
                if (!name.trim()) setCreating(false);
              }}
              placeholder="Playlist name"
              className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-text placeholder:text-dim focus:border-accent focus:outline-none"
            />
          </form>
        ) : null}

        <ul className="-mx-1 min-h-0 flex-1 overflow-y-auto">
          {playlists.length === 0 ? (
            <li className="px-3 py-2 text-sm text-dim">No playlists yet</li>
          ) : (
            playlists.map((playlist) => {
              const active = pathname === `/playlist/${playlist.id}`;

              return (
                <li key={playlist.id}>
                  <div
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      active ? "bg-card-hover text-text" : "text-muted hover:bg-card hover:text-text"
                    }`}
                  >
                    <Link href={`/playlist/${playlist.id}`} className="min-w-0 flex-1">
                      <span className="block truncate">{playlist.name}</span>
                      <span className="block truncate text-xs text-dim">
                        {playlist.tracks.length}{" "}
                        {playlist.tracks.length === 1 ? "song" : "songs"}
                      </span>
                    </Link>

                    {playlist.tracks.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => play(playlist.tracks, 0)}
                        className="rounded-full p-1.5 text-muted transition hover:text-text"
                        aria-label={`Play ${playlist.name}`}
                      >
                        <EqualizerIcon className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-4 rounded-md px-3 py-2 text-sm font-semibold transition ${
          active ? "bg-card text-text" : "text-muted hover:text-text"
        }`}
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}
