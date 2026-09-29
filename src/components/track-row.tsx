"use client";

import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { useToast } from "@/context/toast-context";
// Playlists are paused: TrashIcon was only used by the remove-from-playlist button.
// import { MoreIcon, PlayIcon } from "@/components/icons";
import { MoreIcon, PlayIcon } from "@/components/icons";
import { CoverArt } from "@/components/cover-art";
import { formatTime, type TrackWithUrls } from "@/lib/tracks";

type TrackRowProps = {
  track: TrackWithUrls;
  index?: number;
  // Playlists are paused. The playlist page is the only caller that passed
  // these, and it is commented out, so they are unused for now.
  // playlistId?: string;
  // onRemoved?: () => void;
};

export function TrackRow({ track, index }: TrackRowProps) {
  const { current, isPlaying, play, addToQueue, setNowPlayingOpen } = usePlayer();
  // Playlists are paused: only removeTrack is still used from here.
  // const { user, playlists, addToPlaylist, removeFromPlaylist, removeTrack } = useMusic();
  const { user, removeTrack, tracks } = useMusic();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Listening is public, but anything that writes needs a signed in admin.
  const canEdit = Boolean(user);
  const isCurrent = current?.id === track.id;

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // A row is one song inside the library, so the library itself is the queue.
  // Handing the player a single-track array left previous/next with nowhere
  // to go, which is why they appeared to do nothing.
  const playFromLibrary = () => {
    const position = tracks.findIndex((item) => item.id === track.id);
    play(position >= 0 ? tracks : [track], Math.max(position, 0));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${track.title}"? The audio file goes too.`)) return;

    setBusy(true);
    try {
      await removeTrack(track.id);
      toast(`Deleted ${track.title}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not delete that song", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`group grid grid-cols-[16px_minmax(0,4fr)_minmax(0,3fr)_auto] items-center gap-4 rounded-md px-2 py-2 transition md:grid-cols-[16px_minmax(0,6fr)_minmax(0,4fr)_minmax(0,3fr)_auto] ${
        isCurrent ? "bg-card-hover" : "hover:bg-card"
      }`}
    >
      <button
        type="button"
        onClick={playFromLibrary}
        className="flex h-4 w-4 items-center justify-center text-muted transition hover:text-text"
        aria-label={`Play ${track.title}`}
      >
        {isCurrent && isPlaying ? (
          <span className="flex h-3.5 w-3.5 items-end justify-between text-accent-soft" aria-hidden="true">
            <span className="equalizer-bar h-full w-[2px] rounded-sm bg-current" />
            <span className="equalizer-bar h-full w-[2px] rounded-sm bg-current" />
            <span className="equalizer-bar h-full w-[2px] rounded-sm bg-current" />
          </span>
        ) : (
          <>
            <span className="text-sm tabular-nums group-hover:hidden">
              {index === undefined ? "•" : index + 1}
            </span>
            <PlayIcon className="hidden h-3.5 w-3.5 group-hover:block" />
          </>
        )}
      </button>

      <div className="flex min-w-0 items-center gap-3">
        {/* Clicking the song opens the big cover. The play button above is the
            quiet way to start it without the view taking over. */}
        <button
          type="button"
          onClick={() => {
            playFromLibrary();
            setNowPlayingOpen(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-3 rounded text-left transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`Show ${track.title}`}
        >
          <CoverArt
            src={track.coverUrl}
            title={track.title}
            className="h-10 w-10 shrink-0"
          />
          <span className="min-w-0">
            <span
              className={`block truncate text-sm font-medium ${
                isCurrent ? "text-accent-soft" : "text-text"
              }`}
            >
              {track.title}
            </span>
            <span className="block truncate text-xs text-muted">{track.artist}</span>
          </span>
        </button>
      </div>

      <p className="hidden truncate text-sm text-muted md:block">{track.album ?? "—"}</p>

      <p className="hidden text-sm tabular-nums text-muted md:block">
        {formatTime(track.duration)}
      </p>

      <div className="flex items-center justify-end gap-1">
        {/* Playlists are paused: the remove-from-playlist button is not rendered.
        {playlistId && canEdit ? (
          <button
            type="button"
            onClick={() => {
              void removeFromPlaylist(playlistId, track.id);
              onRemoved?.();
            }}
            className="rounded-full p-2 text-muted transition hover:text-text"
            aria-label={`Remove ${track.title} from this playlist`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        ) : null}
        */}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full p-2 text-muted transition hover:text-text"
            aria-label={`More options for ${track.title}`}
            aria-expanded={menuOpen}
          >
            <MoreIcon className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-10 z-30 w-60 overflow-hidden rounded-lg border border-line bg-elevated py-1 text-sm shadow-2xl shadow-black/60">
              <MenuItem
                label="Add to queue"
                onClick={() => {
                  addToQueue(track);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                label="Play next"
                onClick={() => {
                  addToQueue(track);
                  toast(`${track.title} added to the queue`);
                  setMenuOpen(false);
                }}
              />

              {/* Playlists are paused: the "Add to playlist" submenu is gone.
              {canEdit ? (
                playlists.length > 0 ? (
                  <>
                    <div className="mt-1 border-t border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-dim">
                      Add to playlist
                    </div>
                    {playlists.map((playlist) => {
                      const alreadyIn = playlist.tracks.some((item) => item.id === track.id);

                      return (
                        <MenuItem
                          key={playlist.id}
                          label={playlist.name}
                          disabled={alreadyIn}
                          disabledHint={alreadyIn ? "Added" : undefined}
                          onClick={() => {
                            void addToPlaylist(playlist.id, track.id);
                            toast(`Added to ${playlist.name}`);
                            setMenuOpen(false);
                          }}
                        />
                      );
                    })}
                  </>
                ) : (
                  <MenuItem
                    label="Create a playlist first"
                    disabled
                    onClick={() => setMenuOpen(false)}
                  />
                )
              ) : null}
              */}

              {canEdit ? (
                <div className="mt-1 border-t border-line">
                  <MenuItem
                    label={busy ? "Deleting…" : "Delete song"}
                    tone="danger"
                    disabled={busy}
                    onClick={() => {
                      setMenuOpen(false);
                      void handleDelete();
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  disabled,
  disabledHint,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition disabled:cursor-default ${
        tone === "danger" ? "text-red-400" : "text-text"
      } ${disabled ? "text-dim" : "hover:bg-card-hover"}`}
    >
      <span className="truncate">{label}</span>
      {disabledHint ? <span className="text-xs text-dim">{disabledHint}</span> : null}
    </button>
  );
}

// Playlists are paused. This row was only ever rendered at the top of the
// playlists sidebar, so nothing references it while the feature is off.
// export function NewPlaylistRow({ onCreate }: { onCreate: () => void }) {
//   return (
//     <button
//       type="button"
//       onClick={onCreate}
//       className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-muted transition hover:bg-card hover:text-text"
//     >
//       <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-dim text-muted">
//         <PlusIcon className="h-4 w-4" />
//       </span>
//       <span>New playlist</span>
//     </button>
//   );
// }
