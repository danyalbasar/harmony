export const AUDIO_BUCKET = "audio";
export const COVER_BUCKET = "covers";

export const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
export const MAX_COVER_BYTES = 8 * 1024 * 1024;

export const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/flac",
  "audio/x-flac",
];

export const COVER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  audioPath: string;
  audioMime: string;
  audioSize: number;
  coverPath: string | null;
  coverMime: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type TrackRow = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number | string;
  audio_path: string;
  audio_mime: string;
  audio_size: number | string;
  cover_path: string | null;
  cover_mime: string | null;
  created_by: string | null;
  created_at: string;
};

export type PlaylistRow = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export function toTrack(row: TrackRow): Track {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    duration: Number(row.duration) || 0,
    audioPath: row.audio_path,
    audioMime: row.audio_mime,
    audioSize: Number(row.audio_size) || 0,
    coverPath: row.cover_path,
    coverMime: row.cover_mime,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function toPlaylist(row: PlaylistRow): Playlist {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function storageUrl(bucket: string, path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export type TrackWithUrls = Track & {
  audioUrl: string;
  coverUrl: string | null;
};

export function withUrls(track: Track): TrackWithUrls {
  return {
    ...track,
    audioUrl: storageUrl(AUDIO_BUCKET, track.audioPath),
    coverUrl: track.coverPath ? storageUrl(COVER_BUCKET, track.coverPath) : null,
  };
}

export function extensionFor(fileName: string) {
  const fromName = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";
  if (fromName) return fromName.replace(/[^a-z0-9]/g, "");
  return "bin";
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
