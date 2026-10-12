"use client";

import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/context/music-context";
import { usePlayer } from "@/context/player-context";
import { useToast } from "@/context/toast-context";
// Playlists are paused: TrashIcon was only used by the remove-from-playlist button.
// import { MoreIcon, PlayIcon } from "@/components/icons";
import { CloseIcon, EqualizerIcon, MoreIcon, PauseIcon, PlayIcon } from "@/components/icons";
import { useModal } from "@/components/use-modal";
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
  const { current, isPlaying, play, prepare, toggle, addToQueue, setNowPlayingOpen } = usePlayer();
  // Playlists are paused: only removeTrack is still used from here.
  // const { user, playlists, addToPlaylist, removeFromPlaylist, removeTrack } = useMusic();
  const { user, removeTrack, tracks } = useMusic();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sheetRef = useModal(menuOpen, () => setMenuOpen(false));

  // Listening is public, but anything that writes needs a signed in admin.
  const canEdit = Boolean(user);
  const isCurrent = current?.id === track.id;

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onClick);
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
      onPointerEnter={() => prepare(track)}
      onFocus={() => prepare(track)}
      onTouchStart={() => prepare(track)}
      className={`group grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-1 rounded-md px-1 py-2 transition lg:grid-cols-[44px_minmax(0,6fr)_minmax(0,4fr)_64px_44px] lg:gap-3 lg:px-2 ${
        isCurrent ? "bg-card-hover" : "hover:bg-card"
      }`}
    >
      <button
        type="button"
        onClick={() => isCurrent ? toggle() : playFromLibrary()}
        className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-text"
        aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {isCurrent && isPlaying ? (
          <>
            <PauseIcon className="h-4 w-4 text-accent-soft lg:hidden" />
            <EqualizerIcon className="hidden text-accent-soft lg:flex" />
          </>
        ) : (
          <>
            <span className="hidden text-sm tabular-nums lg:block lg:group-hover:hidden lg:group-focus-within:hidden">
              {index === undefined ? "•" : index + 1}
            </span>
            <PlayIcon className="h-4 w-4 lg:hidden lg:group-hover:block lg:group-focus-within:block" />
          </>
        )}
      </button>

      <div className="flex min-w-0 items-center gap-3">
        {/* Clicking the song opens the big cover. The play button above is the
            quiet way to start it without the view taking over. */}
        <button
          type="button"
          onClick={() => {
            if (!isCurrent) playFromLibrary();
            setNowPlayingOpen(true);
          }}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded text-left lg:gap-3 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`Show ${track.title}`}
        >
          <CoverArt
            src={track.coverUrl}
            title={track.title}
            className="h-10 w-10 shrink-0"
          />
          <span className="min-w-0 flex-1">
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

      <p className="hidden truncate text-sm text-muted lg:block">{track.album ?? "—"}</p>

      <p className="hidden text-sm tabular-nums text-muted lg:block">
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
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-text"
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
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-text"
            aria-label={`More options for ${track.title}`}
            aria-expanded={menuOpen}
          >
            <MoreIcon className="h-5 w-5" />
          </button>

          {menuOpen ? (
            <>
            <button type="button" aria-label="Close song options" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[75] bg-black/60 lg:hidden" />
            <div ref={sheetRef} role="dialog" aria-modal="true" aria-label={`Options for ${track.title}`} tabIndex={-1}
              className="safe-inline fixed inset-x-0 bottom-0 z-[80] max-h-[80dvh] overflow-y-auto overscroll-contain rounded-t-2xl border border-line bg-elevated pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 text-sm shadow-2xl shadow-black/60 lg:absolute lg:inset-x-auto lg:right-0 lg:bottom-auto lg:top-12 lg:w-60 lg:rounded-lg lg:py-1">
              <div className="mb-2 flex min-w-0 items-center gap-3 border-b border-line px-3 pb-2 lg:hidden">
                <span className="min-w-0 flex-1 truncate font-semibold">{track.title}</span>
                <button type="button" aria-label="Close song options" onClick={() => setMenuOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted"><CloseIcon className="h-5 w-5" /></button>
              </div>
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
            </>
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
      className={`flex w-full items-center justify-between min-h-11 gap-2 px-3 py-3 text-left transition disabled:cursor-default ${
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
