"use client";

import { useRef, useState, type DragEvent } from "react";
import { useMusic } from "@/context/music-context";
import { useToast } from "@/context/toast-context";
import { CoverArt } from "@/components/cover-art";
import { CloseIcon, ImageIcon, UploadIcon } from "@/components/icons";
import {
  AUDIO_MIME_TYPES,
  COVER_MIME_TYPES,
  MAX_AUDIO_BYTES,
  MAX_COVER_BYTES,
  formatBytes,
  formatTime,
} from "@/lib/tracks";

function readDuration(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();

    const done = (value: number) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };

    audio.addEventListener("loadedmetadata", () => {
      done(Number.isFinite(audio.duration) ? audio.duration : 0);
    });
    audio.addEventListener("error", () => done(0));
    audio.src = url;
  });
}

export function UploadForm() {
  const { uploadSong } = useMusic();
  const toast = useToast();

  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [duration, setDuration] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const pickAudio = async (file: File) => {
    if (!AUDIO_MIME_TYPES.includes(file.type)) {
      toast(`${file.name} is not a supported audio format.`, "error");
      return;
    }

    if (file.size > MAX_AUDIO_BYTES) {
      toast(`${file.name} is ${formatBytes(file.size)}. The limit is 100 MB.`, "error");
      return;
    }

    setAudio(file);
    setDuration(await readDuration(file));

    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim());
    }
  };

  const pickCover = (file: File) => {
    if (!COVER_MIME_TYPES.includes(file.type)) {
      toast("Cover art has to be a JPEG, PNG, WebP or GIF.", "error");
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      toast(`That image is ${formatBytes(file.size)}. The limit is 8 MB.`, "error");
      return;
    }

    setCoverPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });

    setCover(file);
  };

  const clearCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCover(null);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const dropped = Array.from(event.dataTransfer.files);
    const audioFile = dropped.find((file) => file.type.startsWith("audio/"));
    const coverFile = dropped.find((file) => file.type.startsWith("image/"));

    if (audioFile) void pickAudio(audioFile);
    else if (dropped.length > 0) toast("That file is not audio.", "error");

    if (coverFile) pickCover(coverFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!audio) {
      toast("Pick an audio file first.", "error");
      return;
    }

    if (!title.trim() || !artist.trim()) {
      toast("Title and artist are both required.", "error");
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      const track = await uploadSong({ audio, cover, title, artist, album, duration, onProgress: setProgress });
      toast(`Uploaded ${track.title}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed", "error");
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Add a song</h1>
        <p className="mt-1 text-sm text-muted">
          It appears on the public player as soon as it finishes. MP3, WAV, OGG, M4A, FLAC or WebM,
          up to 100 MB.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
              dragging ? "border-accent bg-card" : "border-line bg-elevated/50"
            }`}
          >
            <input
              ref={audioInput}
              type="file"
              accept={AUDIO_MIME_TYPES.join(",")}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void pickAudio(file);
                event.target.value = "";
              }}
            />

            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card-hover text-accent-soft">
                <UploadIcon className="h-6 w-6" />
              </span>

              {audio ? (
                <>
                  <p className="text-sm font-semibold">{audio.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(audio.size)}
                    {duration > 0 ? ` · ${formatTime(duration)}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAudio(null);
                      setDuration(0);
                    }}
                    className="mt-1 text-xs text-muted underline-offset-4 transition hover:text-text hover:underline"
                  >
                    Choose a different file
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">Drag a song here</p>
                  <p className="text-xs text-muted">or</p>
                  <button
                    type="button"
                    onClick={() => audioInput.current?.click()}
                    className="rounded-full bg-text px-6 py-2.5 text-sm font-bold text-black transition hover:scale-[1.02]"
                  >
                    Choose a file
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required value={title} onChange={setTitle} placeholder="Song title" />
            <Field label="Artist" required value={artist} onChange={setArtist} placeholder="Artist name" />
            <div className="sm:col-span-2">
              <Field label="Album" value={album} onChange={setAlbum} placeholder="Optional" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {busy ? (
              <>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-card">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-150"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted">
                  Uploading directly to storage · {Math.round(progress * 100)}%
                </p>
              </>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || !audio}
                className="rounded-full bg-accent px-8 py-3 text-sm font-bold text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Uploading…" : "Upload"}
              </button>

              {!busy ? (
                <span className="text-sm text-muted">
                  Files go straight to storage, so size is not a problem.
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Cover art
          </span>

          <div className="rounded-xl bg-elevated/50 p-4">
            <div className="relative mx-auto w-full max-w-[220px]">
              <CoverArt
                src={coverPreview}
                title={title || "cover art"}
                className="aspect-square w-full shadow-lg shadow-black/40"
                rounded="rounded-lg"
              />

              {coverPreview ? (
                <button
                  type="button"
                  onClick={clearCover}
                  className="absolute -right-2 -top-2 rounded-full bg-black p-1.5 text-white shadow-lg transition hover:bg-card-hover"
                  aria-label="Remove cover art"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <input
              ref={coverInput}
              type="file"
              accept={COVER_MIME_TYPES.join(",")}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) pickCover(file);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-text"
            >
              <ImageIcon className="h-4 w-4" />
              {cover ? "Replace image" : "Choose image"}
            </button>

            <p className="mt-3 text-center text-xs leading-relaxed text-dim">
              A square image looks best. You can add one now or change it later.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">
        {label}
        {required ? <span className="text-accent-soft"> *</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-line bg-card px-3 py-2.5 text-sm text-text placeholder:text-dim focus:border-accent focus:outline-none"
      />
    </label>
  );
}
